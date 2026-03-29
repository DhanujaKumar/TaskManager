create database task;
use task;

create table users (
	id int auto_increment primary key,
    email varchar(50) unique,
    password varchar(16),
    role enum('admin', 'user') default 'user'
);
ALTER TABLE users
ADD COLUMN name VARCHAR(100) NOT NULL;

alter table users modify password varchar(255);

insert into users (email,password, role) values('admin@gmail.com','$2b$10$H03iOq5kewLEzcxLuiXs2uGltKA5W/TxQN13dm5dyAz9iPzANDWO', 'admin');

select * from users;

UPDATE users
SET password = '$2b$10$LydFz8OQh2v085MYD4Y7EeFMPV26pzVn.ucgl02J6TU9IkJcKRkAq'
WHERE email = 'admin@gmail.com';

UPDATE users
SET name = 'admin'
WHERE email = 'admin@gmail.com';



CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status ENUM('pending','in_progress','completed') DEFAULT 'pending',
  assigned_to INT,
  created_by INT,
  deadline DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

