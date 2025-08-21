CREATE TABLE recipes (
id SERIAL PRIMARY KEY,
cuisine VARCHAR(100),
title VARCHAR(255),
rating FLOAT,
prep_time INTEGER,
cook_time INTEGER,
total_time INTEGER,
description TEXT,
nutrients JSONB,
serves VARCHAR(50)
);