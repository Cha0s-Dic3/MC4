INSERT INTO about_content (id, headline, body)
VALUES (
  1,
  'About Naomie',
  'I build modern, reliable web experiences with a focus on performance, clean design, and real business value.'
)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO projects (title, description, live_link, image_url)
SELECT
  'Cyber Nexus Portfolio',
  'Personal portfolio platform connected to backend CRUD for projects, about content, contact messages, and CV management.',
  'https://example.com/cyber-nexus',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE title = 'Cyber Nexus Portfolio'
);

INSERT INTO projects (title, description, live_link, image_url)
SELECT
  'Task Flow Dashboard',
  'A productivity dashboard focused on clean UI, team progress tracking, and actionable analytics.',
  'https://example.com/task-flow',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80'
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE title = 'Task Flow Dashboard'
);

INSERT INTO projects (title, description, live_link, image_url)
SELECT
  'React UI Starter',
  'Reusable frontend starter with React and TypeScript for building maintainable and modern interfaces.',
  'https://example.com/react-ui-starter',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80'
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE title = 'React UI Starter'
);

INSERT INTO project_comments (project_id, commenter_name, commenter_email, comment)
SELECT
  p.id,
  'Aline',
  'aline@example.com',
  'This project structure is very clean and easy to navigate.'
FROM projects p
WHERE p.title = 'Cyber Nexus Portfolio'
  AND NOT EXISTS (
    SELECT 1
    FROM project_comments c
    WHERE c.project_id = p.id
      AND c.commenter_name = 'Aline'
      AND c.comment = 'This project structure is very clean and easy to navigate.'
  );

INSERT INTO project_comments (project_id, commenter_name, commenter_email, comment)
SELECT
  p.id,
  'Jean',
  'jean@example.com',
  'Love the visual style and smooth page flow.'
FROM projects p
WHERE p.title = 'Task Flow Dashboard'
  AND NOT EXISTS (
    SELECT 1
    FROM project_comments c
    WHERE c.project_id = p.id
      AND c.commenter_name = 'Jean'
      AND c.comment = 'Love the visual style and smooth page flow.'
  );

INSERT INTO messages (sender_name, sender_email, sender_contact, message, is_read)
SELECT
  'Backend Seed',
  'seed@example.com',
  NULL,
  'Welcome. Contact form submissions from frontend are stored in this table.',
  0
WHERE NOT EXISTS (
  SELECT 1
  FROM messages
  WHERE sender_name = 'Backend Seed'
    AND message = 'Welcome. Contact form submissions from frontend are stored in this table.'
);
