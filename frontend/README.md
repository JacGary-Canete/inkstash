cd C:\Users\l23y19w14\inkstash
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$readme = @"
# InkStash — Tattoo Artist Flash Booking & Deposit Platform

Full-stack web application built with **React (Vite)**, **Java Spring Boot**, and **MySQL**, implementing User Account Creation, JWT Session Authentication, and Role-Based Access Control (RBAC) for `CLIENT` and `ARTIST` roles.

## Prerequisites
- **Java 17+**
- **Node.js 20+** and **npm**
- **MySQL 8.0+** running locally on port `3306`

## 1. Database Setup
1. Start your local MySQL server.
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS inkstash_db;