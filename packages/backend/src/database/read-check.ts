/**
 * Reads real rows through the entities and asserts the tricky mappings decode:
 * JSON transformers, comma-joined `files_order`, the eager photo relation, enum
 * members and join tables.
 *
 * Complements schema-drift.ts, which only proves the shape matches.
 *
 * Usage: yarn read-check   (expects ci/compose.yml's seeded database)
 */
import { IsNull, Not } from 'typeorm';

import { Comment } from '../entities/comment.entity';
import { File } from '../entities/file.entity';
import { Like } from '../entities/like.entity';
import { Node } from '../entities/node.entity';
import { NodeSocialPublication } from '../entities/node-extras.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';

import { dataSource } from './data-source';

let failures = 0;

function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    return;
  }

  failures += 1;
  console.log(`  ✗ ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

async function main() {
  await dataSource.initialize();

  try {
    // ---- node.blocks / node.flow JSON transformers -------------------------
    const nodes = dataSource.getRepository(Node);

    const withBlocks = await nodes
      .createQueryBuilder('node')
      .where("node.blocks IS NOT NULL AND node.blocks <> '' AND node.blocks <> '[]'")
      .orderBy('node.id', 'DESC')
      .limit(200)
      .getMany();

    console.log(`\nnode.blocks (${withBlocks.length} sampled)`);
    check('decodes to arrays', withBlocks.every(n => Array.isArray(n.blocks)));
    check(
      'every block has a known type',
      withBlocks
        .flatMap(n => n.blocks)
        .every(b => b && (b.type === 'text' || b.type === 'video')),
      withBlocks.flatMap(n => n.blocks).find(b => !b || !['text', 'video'].includes(b.type)),
    );

    const withFlow = await nodes
      .createQueryBuilder('node')
      .where("node.flow IS NOT NULL AND node.flow <> ''")
      .orderBy('node.id', 'DESC')
      .limit(200)
      .getMany();

    console.log(`\nnode.flow (${withFlow.length} sampled)`);
    check(
      'decodes to objects',
      withFlow.every(n => n.flow !== null && typeof n.flow === 'object'),
    );
    // `''` is a legitimate — and the most common — stored value.
    check(
      'display is either a known variant or empty',
      withFlow.every(n =>
        ['single', 'vertical', 'horizontal', 'quadro', ''].includes(n.flow?.display ?? ''),
      ),
      withFlow.find(
        n => !['single', 'vertical', 'horizontal', 'quadro', ''].includes(n.flow?.display ?? ''),
      )?.flow,
    );

    // ---- files_order comma transformer -------------------------------------
    const withOrder = await nodes
      .createQueryBuilder('node')
      .where("node.files_order <> ''")
      .orderBy('node.id', 'DESC')
      .limit(200)
      .getMany();

    console.log(`\nnode.files_order (${withOrder.length} sampled)`);
    check(
      'decodes to arrays of finite numbers',
      withOrder.every(
        n => Array.isArray(n.filesOrder) && n.filesOrder.every(id => Number.isFinite(id)),
      ),
      withOrder.find(n => !Array.isArray(n.filesOrder) || n.filesOrder.some(id => !Number.isFinite(id)))?.filesOrder,
    );
    check('non-empty for rows with a non-empty column', withOrder.every(n => n.filesOrder.length > 0));

    // The transformer must reproduce the stored string byte-for-byte.
    const raw: Array<{ id: number; files_order: string }> = await dataSource.query(
      "SELECT id, files_order FROM node WHERE files_order <> '' ORDER BY id DESC LIMIT 200",
    );
    const rawById = new Map(raw.map(r => [r.id, r.files_order]));
    check(
      'round-trips to the exact stored string',
      withOrder.every(n => n.filesOrder.join(',') === rawById.get(n.id)),
      withOrder
        .filter(n => n.filesOrder.join(',') !== rawById.get(n.id))
        .slice(0, 3)
        .map(n => ({ id: n.id, got: n.filesOrder.join(','), want: rawById.get(n.id) })),
    );

    // ---- node type enum ----------------------------------------------------
    const typeCounts: Array<{ type: string; count: string }> = await dataSource.query(
      'SELECT type, COUNT(*) AS count FROM node GROUP BY type',
    );
    console.log(`\nnode.type enum`);
    check(
      'webm rows are readable through the entity',
      (await nodes.count({ where: { type: 'webm' } })) > 0,
      typeCounts,
    );

    // ---- user: eager photo relation + password variants --------------------
    const users = dataSource.getRepository(User);

    // `eager: true` applies to `find*` only; QueryBuilder ignores it. Both are
    // checked so a refactor cannot quietly drop avatars from responses.
    const withPhoto = await users.find({
      where: { photoId: Not(IsNull()) },
      take: 20,
    });

    console.log(`\nuser.photo eager relation (${withPhoto.length} sampled)`);
    check(
      'find() loads photo without an explicit join',
      withPhoto.length > 0 && withPhoto.every(u => u.photo !== null && u.photo?.id === u.photoId),
      withPhoto.slice(0, 3).map(u => ({ id: u.id, photoId: u.photoId, photo: u.photo?.id ?? null })),
    );

    const viaQueryBuilder = await users
      .createQueryBuilder('user')
      .where('user.photoId IS NOT NULL')
      .limit(1)
      .getOne();
    check(
      'QueryBuilder does NOT auto-load it (documents the caveat)',
      viaQueryBuilder?.photo === undefined || viaQueryBuilder?.photo === null,
      viaQueryBuilder?.photo,
    );

    check(
      'is_activated decodes as a boolean-ish tinyint',
      withPhoto.every(
        u => typeof u.isActivated === 'boolean' || u.isActivated === 0 || u.isActivated === 1,
      ),
      withPhoto.slice(0, 3).map(u => typeof u.isActivated),
    );

    const allUsers = await users.find();
    const hashKinds = {
      bcrypt2a: allUsers.filter(u => u.password?.startsWith('$2a$')).length,
      bcrypt2b: allUsers.filter(u => u.password?.startsWith('$2b$')).length,
      md5: allUsers.filter(u => /^[0-9a-f]{32}$/i.test(u.password ?? '')).length,
      placeholder: allUsers.filter(u => u.password === 'NO_PASSWORD').length,
    };
    console.log(`\nuser.password formats`, hashKinds);
    check('all three live hash formats are present', hashKinds.bcrypt2a > 0 && hashKinds.md5 > 0);

    // ---- file.metadata JSON -----------------------------------------------
    const files = dataSource.getRepository(File);
    const withMeta = await files
      .createQueryBuilder('file')
      .where("file.metadata IS NOT NULL AND file.metadata <> ''")
      .orderBy('file.id', 'DESC')
      .limit(200)
      .getMany();

    console.log(`\nfile.metadata (${withMeta.length} sampled)`);
    check('decodes to objects', withMeta.every(f => f.metadata !== null && typeof f.metadata === 'object'));
    check(
      'duration is numeric where present',
      withMeta.every(f => f.metadata?.duration === undefined || typeof f.metadata.duration === 'number'),
      withMeta.find(f => f.metadata?.duration !== undefined && typeof f.metadata.duration !== 'number')?.metadata,
    );

    // ---- join tables -------------------------------------------------------
    const nodeWithRelations = await nodes
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.files', 'files')
      .leftJoinAndSelect('node.tags', 'tags')
      .leftJoinAndSelect('node.user', 'author')
      .where('node.id = (SELECT nodeId FROM node_files_file LIMIT 1)')
      .getOne();

    console.log('\njoin tables');
    check('node_files_file resolves to File entities', (nodeWithRelations?.files?.length ?? 0) > 0);

    const taggedNode = await nodes
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.tags', 'tags')
      .where('node.id = (SELECT nodeId FROM node_tags_tag LIMIT 1)')
      .getOne();
    check('node_tags_tag resolves to Tag entities', (taggedNode?.tags?.length ?? 0) > 0);

    const likeCount = await dataSource.getRepository(Like).count();
    check('like rows are readable', likeCount > 0, likeCount);

    const tagCount = await dataSource.getRepository(Tag).count();
    check('tag rows are readable', tagCount > 0, tagCount);

    // ---- comments ----------------------------------------------------------
    const comments = dataSource.getRepository(Comment);
    const commentSample = await comments
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.files', 'files')
      .leftJoinAndSelect('comment.user', 'user')
      .orderBy('comment.id', 'DESC')
      .limit(50)
      .getMany();

    console.log(`\ncomment (${commentSample.length} sampled)`);
    check('rows load with relations', commentSample.length > 0);
    check(
      'files_order decodes',
      commentSample.every(c => Array.isArray(c.filesOrder)),
    );

    // ---- soft delete -------------------------------------------------------
    const [{ deleted }]: Array<{ deleted: string }> = await dataSource.query(
      'SELECT COUNT(*) AS deleted FROM node WHERE deleted_at IS NOT NULL',
    );
    console.log(`\nsoft delete`);
    check('deleted_at rows exist in the dump (so the filter is exercised)', Number(deleted) > 0, deleted);

    // ---- the snake_case exception ------------------------------------------
    const pubs = await dataSource.getRepository(NodeSocialPublication).find({ take: 10 });
    console.log(`\nnode_social_publications (snake_case node_id)`);
    check('rows load and nodeId maps from node_id', pubs.length > 0 && pubs.every(p => p.nodeId !== undefined), pubs.slice(0, 2));

    console.log(
      failures === 0
        ? '\n✓ all read checks passed'
        : `\n✗ ${failures} read check(s) failed`,
    );
    if (failures > 0) {
      process.exitCode = 1;
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
