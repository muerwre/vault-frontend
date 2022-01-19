import { autorun, makeAutoObservable, runInAction } from 'mobx';
import { keys, values, without } from 'ramda';

import { EmbedMetadata } from '~/types/metadata';

const MAX_QUEUE_SIZE = 25;

/** MetadataStore handles metadata fetching for youtube videos */
export class MetadataStore {
  metadata: Record<string, EmbedMetadata> = {};
  queue: string[] = [];
  pending: string[] = [];

  constructor(
    protected apiMetadataLoader: (ids: string[]) => Promise<Record<string, EmbedMetadata>>
  ) {
    makeAutoObservable(this);
  }

  /**
   * watch()
   * starts watching for queue, calling apiMetadataLoader
   * when 300ms passed or queue is bigger than MAX_QUEUE_SIZE
   */
  watch = () => {
    let timeout: NodeJS.Timeout;

    return autorun(() => {
      if (timeout) {
        clearTimeout(timeout);
      }

      if (this.queue.length >= MAX_QUEUE_SIZE) {
        const items = this.queue.slice(0, MAX_QUEUE_SIZE);

        if (!items.length) {
          return;
        }

        void this.fetch(items);
      }

      timeout = setTimeout(() => {
        if (!this.queue.length) {
          return;
        }

        void this.fetch(this.queue);
      }, 300);
    });
  };

  /** fetches metadata for items */
  private fetch = async (items: string[]) => {
    runInAction(() => {
      this.omitQueueItems(items);
      this.pushPending(items);
    });

    try {
      const result = await this.apiMetadataLoader(items);
      const fetchedIDs = values(result).map(it => it.address);

      runInAction(() => {
        this.pushMetadataItems(result);
        this.pending = without(fetchedIDs, this.pending);
      });
    } catch (error) {
      console.warn(error);
    }
  };

  /** adds items to queue */
  enqueue = (id: string) => {
    if (this.queue.includes(id) || keys(this.metadata).includes(id) || this.pending.includes(id)) {
      return;
    }

    this.queue.push(id);
  };

  /** pushes items to pending list */
  pushPending = (ids: string[]) => this.pending.push(...ids);

  /** clears queue */
  omitQueueItems = (ids: string[]) => (this.queue = without(ids, this.queue));

  /** adds metadata items */
  pushMetadataItems = (items: Record<string, EmbedMetadata>) =>
    (this.metadata = { ...this.metadata, ...items });
}
