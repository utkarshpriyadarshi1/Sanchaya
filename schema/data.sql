-- Default taxonomy template seeds for e-Patra

-- Insert master categories
INSERT OR IGNORE INTO category (id, name) VALUES (1, 'Finance');
INSERT OR IGNORE INTO category (id, name) VALUES (2, 'Legal');
INSERT OR IGNORE INTO category (id, name) VALUES (3, 'HR');
INSERT OR IGNORE INTO category (id, name) VALUES (4, 'Operations');

-- Insert child subcategories associated with parent categories
INSERT OR IGNORE INTO sub_category (id, name, category_id) VALUES (1, 'Invoices', 1);
INSERT OR IGNORE INTO sub_category (id, name, category_id) VALUES (2, 'Receipts', 1);
INSERT OR IGNORE INTO sub_category (id, name, category_id) VALUES (3, 'Tax Files', 1);
INSERT OR IGNORE INTO sub_category (id, name, category_id) VALUES (4, 'Contracts', 2);
INSERT OR IGNORE INTO sub_category (id, name, category_id) VALUES (5, 'Compliance', 2);
INSERT OR IGNORE INTO sub_category (id, name, category_id) VALUES (6, 'Onboarding', 3);
INSERT OR IGNORE INTO sub_category (id, name, category_id) VALUES (7, 'Policies', 3);
INSERT OR IGNORE INTO sub_category (id, name, category_id) VALUES (8, 'Reports', 4);
INSERT OR IGNORE INTO sub_category (id, name, category_id) VALUES (9, 'Schedules', 4);
