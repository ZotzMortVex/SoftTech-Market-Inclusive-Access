CREATE DATABASE IF NOT EXISTS softtech_market
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE softtech_market;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) NOT NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  brand VARCHAR(120) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  original_price DECIMAL(12, 2) NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_count INT UNSIGNED NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  visual_cert TEXT NOT NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  reviews_count INT UNSIGNED NOT NULL DEFAULT 0,
  primary_image_url TEXT NOT NULL,
  image_angles JSON NOT NULL,
  description TEXT NOT NULL,
  visual_alert TEXT NOT NULL,
  specs JSON NOT NULL,
  inclusive_features JSON NOT NULL,
  lsc_video_url VARCHAR(2048) NOT NULL DEFAULT '/assets/videos/welcome.mp4',
  accounting_value DECIMAL(12, 2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY products_code_unique (code),
  INDEX products_active_category_idx (active, category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  phone VARCHAR(32) NOT NULL DEFAULT '',
  preferred_channel ENUM('sms_visual', 'email_escrito', 'portal') NOT NULL DEFAULT 'sms_visual',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_sessions (
  session_id VARCHAR(128) NOT NULL,
  expires_at BIGINT UNSIGNED NOT NULL,
  session_data MEDIUMTEXT NOT NULL,
  PRIMARY KEY (session_id),
  INDEX user_sessions_expires_at_idx (expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_hash CHAR(64) NOT NULL,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token_hash),
  INDEX password_reset_user_idx (user_id),
  INDEX password_reset_expiry_idx (expires_at),
  CONSTRAINT password_reset_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sales_orders (
  order_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(64) NULL,
  total DECIMAL(14, 2) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pendiente',
  order_details LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  INDEX sales_orders_created_at_idx (created_at),
  INDEX sales_orders_user_id_idx (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sales_order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id VARCHAR(128) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  product_code VARCHAR(64) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY (id),
  INDEX sales_order_items_order_idx (order_id),
  INDEX sales_order_items_product_idx (product_id),
  CONSTRAINT sales_order_items_order_fk
    FOREIGN KEY (order_id) REFERENCES sales_orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS simulated_payment_wallets (
  id VARCHAR(64) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(14, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY simulated_wallet_email_unique (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS simulated_payment_transactions (
  payment_id CHAR(36) NOT NULL,
  order_id VARCHAR(128) NOT NULL,
  user_id CHAR(36) NOT NULL,
  wallet_email VARCHAR(254) NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  balance_after DECIMAL(14, 2) NOT NULL,
  status VARCHAR(16) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  UNIQUE KEY simulated_payment_order_unique (order_id),
  INDEX simulated_payment_user_idx (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mercadopago_pending_orders (
  order_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  preference_id VARCHAR(128) NOT NULL,
  subtotal DECIMAL(14, 2) NOT NULL,
  tax DECIMAL(14, 2) NOT NULL,
  total DECIMAL(14, 2) NOT NULL,
  order_details LONGTEXT NOT NULL,
  items LONGTEXT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  payment_id VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  UNIQUE KEY mercadopago_preference_unique (preference_id),
  INDEX mercadopago_pending_user_idx (user_id)
) ENGINE=InnoDB;
