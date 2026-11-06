-- Synthetic fixtures for an empty database built by the baseline migration.
--
-- Never seed CI from the production dump: it carries real accounts, emails and
-- password hashes. This is the smallest data set the suite needs — authored
-- flow posts, a lab post, the Boris node and a few comments. The specs discover
-- fixtures through the api, so ids here only matter where the app hardcodes
-- them (Boris is node 696).
--
-- Flow posts are backdated past 30 days on purpose: the flow's `after` page is
-- what precedes the default window, so a post created today is not in it.

INSERT INTO `user` (`id`, `username`, `password`, `email`, `role`, `is_activated`, `last_seen`, `created_at`, `updated_at`, `fullname`, `description`)
VALUES
  (1, 'e2e_author', 'NO_PASSWORD', 'author@e2e.invalid', 'user', 1, NOW(), NOW() - INTERVAL 30 DAY, NOW(), 'E2E Author', 'Writes the fixture posts'),
  (2, 'e2e_reader', 'NO_PASSWORD', 'reader@e2e.invalid', 'user', 1, NOW(), NOW() - INTERVAL 20 DAY, NOW(), '', ''),
  (3, 'e2e_admin', 'NO_PASSWORD', 'admin@e2e.invalid', 'admin', 1, NOW(), NOW() - INTERVAL 40 DAY, NOW(), '', '');

INSERT INTO `node` (`id`, `title`, `type`, `blocks`, `files_order`, `is_public`, `is_promoted`, `commented_at`, `created_at`, `updated_at`, `userId`, `description`, `flow`)
VALUES
  (696, 'Борис', 'boris', NULL, '', 1, 1, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 365 DAY, NOW(), 3, NULL, NULL),
  (1001, 'Первый пост', 'text', '[{"type":"text","text":"Первый тестовый пост, достаточно длинный, чтобы стать описанием узла в ленте."}]', '', 1, 1, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 40 DAY, NOW(), 1, 'Первый тестовый пост, достаточно длинный, чтобы стать описанием узла в ленте.', '{"display":"single","show_description":true}'),
  (1002, 'Второй пост', 'text', '[{"type":"text","text":"Второй тестовый пост."}]', '', 1, 1, NULL, NOW() - INTERVAL 41 DAY, NOW(), 1, 'Второй тестовый пост.', '{"display":"single","show_description":false}'),
  (1003, 'Видео', 'video', '[{"type":"video","url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}]', '', 1, 1, NULL, NOW() - INTERVAL 42 DAY, NOW(), 2, NULL, '{"display":"","show_description":false}'),
  (1004, 'Пост в лаборатории', 'text', '[{"type":"text","text":"Ещё не продвинут в ленту."}]', '', 1, 0, NULL, NOW() - INTERVAL 1 HOUR, NOW(), 2, 'Ещё не продвинут в ленту.', NULL);

INSERT INTO `comment` (`id`, `files_order`, `created_at`, `updated_at`, `userId`, `nodeId`, `text`)
VALUES
  (1, '', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR, 2, 1001, 'Тестовый комментарий к первому посту.'),
  (2, '', NOW() - INTERVAL 90 MINUTE, NOW() - INTERVAL 90 MINUTE, 1, 696, 'Сообщение Борису.'),
  (3, '', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR, 2, 696, 'Ещё одно сообщение Борису.');

INSERT INTO `notification_settings` (`userId`, `enabled`, `show_indicator`, `send_telegram`, `send_email`, `subscribed_to_flow`, `subscribed_to_boris`, `subscribed_to_comments`)
VALUES
  (1, 1, 1, 0, 0, 1, 1, 1),
  (2, 1, 1, 0, 0, 1, 1, 1);
