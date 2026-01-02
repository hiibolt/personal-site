---
title: Creating a Multipart File Upload Server with Rust and Axum
description: Designing a production-ready file upload server with Rust's Axum framework, built on the multipart protocol, with the goal of accepting one or more large file over HTTPS.
date: 2024-01-10 01:09:53-0600
slug: multipart-file-server
image: https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fradiant.jo%2Fwp-content%2Fuploads%2F2016%2F07%2Fbigstock-server-racks-in-server-room-da-150954236.jpg&f=1&nofb=1&ipt=13180a968abe22edb0e6f16147de1ca8020abbb0cd787f6b6258e9ee7899f3d7&ipo=images
categories:
    - Blog Post
tags:
    - Rust
    - Axum
---

In the fast-paced world of web development, crafting an efficient multipart file upload server is a skill worth mastering.

This guide explores the fusion of Rust's performance and safety with the asynchronous prowess of Tokio, along with the ergonomic web framework, Axum. Whether you're a seasoned Rust developer or a newcomer, this article takes you through the creation of a multipart file upload server step by step. 

From setting up your Rust environment to harnessing Tokio's asynchronous power and leveraging Axum's elegant syntax, you'll gain the insights and tools needed to optimize file uploads for modern web applications. Join us on this journey to unlock the potential of Rust, Tokio, and Axum, enabling you to build high-performance and scalable file upload solutions effortlessly.

## Setup - 

Let's start by creating our project workspace with Cargo!
```bash
cargo init
```

Next, we're going to need `tokio` and `axum` in order to host our server and control routing.

Let's add the following lines to our Cargo.toml:
```toml
axum = { version = "0.7.3", features = ["multipart"] }
tokio = { version = "1.35.0", features = ["full"] }
```

## Guide - 

For now, you don't need to understand what a **multipart** is or why we're enabling it. Let's first focus on creating a basic Hello World router with `axum`. 

Let's replace `/src/main.rs` with the following code:

```rust
use axum::{
    routing::{ get },
    Router
};

async fn index() -> String {
    String::from("Hello World!")
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(index));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await.expect("Failed to start listener!");
    
    axum::serve(listener, app)
        .await.expect("Failed to serve 'app'!");
}
```

After starting your server with `cargo run` and navigating to `localhost:3000` in your browser, you should be met with "Hello, World!". 

Congrats! That's the most basic form of server with `axum`, but we're only serving a string right now. Let's instead serve `/public/index.html`. 

Create a new folder in your root workspace and title it **public**. Create an **index.html** file within with the following contents: 
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Multipart Upload Server</title>
    </head>
    <body>
        Hello, HTML!
    </body>
</html>
```

But how do we serve this? Well, `axum` makes this easy. All we have to do is replace our **Hello, World!** code with an HTML response. `axum` does this for us, if we ask it nicely, of course.
```rust
...
use axum::{
    ...
    response::Html,
    ...
};

async fn index() -> Html<&'static str> {
    Html(std::include_str!("../public/index.html"))
}
...
```

After starting your server back up with `cargo run`, navigating to `localhost:3000` now shows **Hello, HTML!**. Nice work!

Now, let's create a file upload form to let us drop our files to the server. Let's replace our **Hello, HTML!** code with the following to do so:
```html
...
    <body>
        <form method="POST" enctype="multipart/form-data">
            <input type="file" name="fileupload" required>
            <button type="submit">Upload File</button>
        </form>
    </body>
...
```

If we restart our server, we now have a very basic file drop page. 

Now, how do we implement the backend?

This form will submit what's called a **multipart request**. This is a type of HTTP request that contains multiple types of data, often used for files. For instance, if you wished to submit a file (raw bytes) and its metadata (text), you have conflicting data types. **Multipart requests** solve this by splitting them.

Let's implement a reciever for it!

First, we'll need to create a route for our incoming POST request. We can do this by chaining a `.post(upload)` onto our existing `.get(index)`.
```rust
use axum::{
    routing::get,
    response::Html,
    extract::Multipart,
    Router
};

async fn index() -> Html<&'static str> {
    Html(std::include_str!("../public/index.html"))
}

async fn upload(mut multipart: Multipart) {
    while let Some(field) = multipart
        .next_field().await.expect("Failed to get next field!")
    {
        if field.name().unwrap() != "fileupload" {
            continue;
        }
        println!("Got file!");
    }
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(index).post(upload));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await.expect("Failed to start listener!");
    
    axum::serve(listener, app)
        .await.expect("Failed to serve 'app'!");
}

```

Now, if we restart our server and upload a file via `localhost:3000`...voila! We get **Got file!** in our output.

Let's break down why.

Our upload axum route function accepts a **Multipart** input, which we then iterate through each field of. We chose to ignore any field that's not explicitly a file upload.

Nice! Now, let's extract the bytes and save the incoming file.

We'll start by creating a new folder in our root directory, `/files`.

Next, let's extract the bytes and save them to a file in said directory.
```rust
use std::{
    fs::File,
    io::Write
};
...
async fn upload(mut multipart: Multipart) {
    while let Some(field) = multipart
        .next_field().await.expect("Failed to get next field!")
    {
        if field.name().unwrap() != "fileupload" {
            continue;
        }
        println!("Got file!");

        // Grab the name
        let file_name = field.file_name()
            .unwrap();

        // Create a path for the soon-to-be file
        let file_path = format!("files/{}", file_name);
        
        // Unwrap the incoming bytes
        let data = field.bytes()
            .await.unwrap();

        // Open a handle to the file
        let mut file_handle = File::create(file_path)
            .expect("Failed to open file handle!");

        // Write the incoming data to the handle
        file_handle.write_all(&data)
            .expect("Failed to write data!");
    }
}
...
```

Start your server back up one last time, and upload a file! 

Congratulations, you should now see whatever file you uploaded in `/files`.

## Result

Our final `/src/main.rs` should look something like this.

```rust
use axum::{
    routing::get,
    response::Html,
    extract::Multipart,
    Router
};
use std::{
    fs::File,
    io::Write
};

async fn index() -> Html<&'static str> {
    Html(std::include_str!("../public/index.html"))
}

async fn upload(mut multipart: Multipart) {
    while let Some(field) = multipart
        .next_field().await.expect("Failed to get next field!")
    {
        if field.name().unwrap() != "fileupload" {
            continue;
        }
        
        // Grab the name
        let file_name = field.file_name()
            .unwrap();

        // Create a path for the soon-to-be file
        let file_path = format!("files/{}", file_name);
        
        // Unwrap the incoming bytes
        let data = field.bytes()
            .await.unwrap();

        // Open a handle to the file
        let mut file_handle = File::create(file_path)
            .expect("Failed to open file handle!");

        // Write the incoming data to the handle
        file_handle.write_all(&data)
            .expect("Failed to write data!");
    }
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(index).post(upload));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await.expect("Failed to start listener!");
    
    axum::serve(listener, app)
        .await.expect("Failed to serve 'app'!");
}
```

## Outro - 

Hopefully you found this article informative or helpful. If you did, follow my [GitHub](https://socials.hiibolt.com/github)!

I often write these articles after struggling to find good documentation on a concept. That means there's often a large-scale project on there related to this article, if you'd like to see it in practice!