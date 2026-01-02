--- 
title: Supercomputing and Undergraduate Research at 18
description: Designing a high-performance Rust backend, integrating high-performance computing scheduling systems, and building a foundational network of microservices.
date: 2024-05-13 08:41:53-0600 
slug: freshman-supercomputing
image: https://www.niu.edu/crcd/images/home-page/il2023-metis-01.jpg
categories:
    - Blog Post
tags:
    - Rust
    - Axum
    - Nix
    - HPC
--- 

During my second semester, I recieved an email regarding a search for qualified individuals to take on undergraduate research. The description of *"Leveraging AI to determine the presence of ASD"* immediately caught my eye. I'm incredibly passionate about helping those less fortunate to learn on a level equaling or surpassing their peers. Being someone who has felt the pain of many students with learning disabilities during my time as a teacher, I felt called to help.  

I know I'm young and unexperienced in many ways; but I immediately knew that the intrinsic motivation of my dedication to the cause would allow me to work with true vigor. The presence of such motivation was something I hoped immediately set me apart from other candidates. After sending an email which detailed my technical experience related to the project and my passion for the cause, I sat back and waited.  

After a short period of time waiting, I received an email that I had been chosen to be one of the two people on the team! 

The goal of the app is deceptively simple at first glance. Autism Spectrum Disorder (ASD) has been shown to cause measurably erratic movements in a person's walking gait cycle. By measuring the gait of a subject and mathematically serializing their movement, one can train and develop a machine learning model capable of predicting the existence of ASD in an individual.

However, the real goal is to automate this. Rather than having to otherwise by hand do the aforementioned, the goal of the application is to fully automate this process. 
A high level overview of the process is, again, deceptively simple: Take a video of the subject walking from the front and one from the side, submit medical data about the patient, and recieve a confidence score on the presence of ASD.

## Process -  

Since mobile devices do not always have the computational power to run a dense machine learning model, I decided to create an intermediary that did. By creating a backend that could accept job submissions, perform computations, and return a score, we could effectively handle these intensive computations on otherwise weak devices.  

![image](https://github.com/hiibolt/hiibolt/assets/91273156/11647ab4-2339-49f4-95d7-452af2f5cbf2)  

In order to do so, we must consider how these computations are performed. Firstly, a [pose estimation](https://en.wikipedia.org/wiki/Pose_(computer_vision)) must be created. This allows us to serialize a person’s current bodily position. Accordingly, by analyzing the rate of change between each position for each joint, we can train a model to scan for abnormalities in [walking gait](https://www.kenhub.com/en/library/anatomy/gait-cycle).  

To accomplish this, we employed Carnegie Mellon’s [OpenPose](https://github.com/CMU-Perceptual-Computing-Lab/openpose).  

![image](https://github.com/CMU-Perceptual-Computing-Lab/openpose/raw/master/.github/media/pose_face_hands.gif)  

OpenPose is extremely computationally intensive and makes usage of the *entire GPU* while running. This creates parallelization issues almost immediately. To understand why, let us consider the following scenario. We have two people who submit a job request within a brief period of time.  

**Person 1:** Submits a job, which the server accepts and gets to work on, putting the GPU at 100% usage.  

**Person 2:** Submits a job, which the server accepts, but immediately errors! OpenPose couldn't access the GPU - it's currently in use!  

![image](https://github.com/hiibolt/hiibolt/assets/91273156/5197cd12-137c-4ca6-b489-cad61869e76d)  

This means that only one job can run at a time. To combat this, we must create our own **queue system**. This means the server should have a list of jobs, running them one at a time. Instead of trying to immediately run incoming submissions, as most API requests are handled, we assume an extended period. Instead of receiving a result on submission, we receive **200 OK**, signifying that while the backend has received your job submission, a result is not ready – check back later.  

![image](https://github.com/hiibolt/hiibolt/assets/91273156/d5196814-377d-4f80-b2aa-f6e32c1358dd)  

This diagram is a great first step to a time-concerned backend system. However, there are additional constraints that were next introduced. Firstly, all entry results and associated data had to be *stored for later retrieval*. This meant we needed a database. For this, I chose [Firebase Realtime DB](https://firebase.google.com/products/realtime-database/). Since Firebase Authentication is very convenient, it becomes useful to use them in parallel. Secondly, we needed to store our user’s videos. This is more complicated than a standard database – these videos can be multiple hundred megabytes. Accordingly, we chose [AWS S3](https://aws.amazon.com/s3/) – since we planned to use AWS EC2 instances to host our backend, it made sense to also use S3.  

![image](https://github.com/hiibolt/hiibolt/assets/91273156/c6f27a3e-6a9e-44d4-a956-a4db4cc80b23)  

Now, we have a few more decisions we must make.  

**What language for the backend?**  
- This was not difficult to decide – [Rust](https://www.rust-lang.org/). Due to the sensitive and especially important nature of our application, it needs to be secure, performant – and fault tolerant. All these characteristics scream Rust.  

**How to containerize the application?**  
- At this point, there are three programs running on AWS. NPM for our React frontend, our Rust-powered backend server, and our OpenPose software. Stacks can get messy quick with this much setup, so [Docker](https://www.docker.com/) became our immediate solution. Docker allows you to keep messy programs defined in a zero-config file which builds an image which always runs, every time.  

![image](https://github.com/hiibolt/hiibolt/assets/91273156/4817a850-1d4f-4b8b-bdd1-71227e7083aa)  

The above diagram is already very secure. However, there is one flaw – Realtime DB must be pseudo-public to be able to re-access results! To combat this, we deliver results by email instead. We still use Firebase DB behind the scenes, but it can now be made private.  

![image](https://github.com/hiibolt/hiibolt/assets/91273156/4be2c6ac-35b7-4621-8e11-18cd24e38ea2)  

At this point, I was very satisfied with the progress that had been made. However, there was one problem – AWS EC2 with GPU acceleration is **not** cheap. Hundreds, and even thousands, of dollars per month. Accordingly, I was incredibly open to using my college’s local machines to do this. Thankfully, with amazing timing, my college's cluster computing department had just created an absolute powerhouse of computation. Boasting over 30 state-of-the-art NVIDIA A100 GPUs, we immediately jumped at the chance to use such power.  

 

Accordingly, we now let AWS EC2 handle job submission requests, and let the university's supercomputer handle the heavy lifting.  

 

![image](https://github.com/hiibolt/hiibolt/assets/91273156/cc1884fa-e1dd-4c93-b77c-8666ef8b8c7c)  

 

This resulting final model is incredibly performant, secure, and HIPAA compliant. 

 

## Implementation - 

Firstly, we must consider the frontend. While I was not the developer of the frontend, my partner was, I did have much to do with its creation. Our frontend needed to be fast and securely authenticated. Accordingly, we selected [React](https://react.dev/). The reasoning is simple - it is arguably the easiest framework to implement Firebase Authentication with.

It needed to have a few inputs - some medical data, and the two videos.

![image](https://github.com/hiibolt/hiibolt/assets/91273156/6c3abf53-cc67-451c-a605-e76d5e726356)

With this out of the way, we need to start designing the backend.

### Backend

Firstly, I designed a small library for interfacing with Firebase Realtime DB for the backend.

```rust
...

#[derive( Serialize, Deserialize, Debug )]
pub struct User {
    pub uid: String,
    pub jobs: Vec<Job>
}
#[derive( Serialize, Deserialize, Clone, Debug )]
pub struct Job {
    pub age: i16,
    pub ethnicity: String,
    pub sex: char,
    pub height: String,
    pub status: Status,
    pub timestamp: SystemTime,
    pub weight: i16,
    pub email: String
}
#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
pub enum StatusCode {
    Submitting,
    SubmissionErr,
    Queue,
    Processing,
    InferenceErr,
    Complete
}
#[derive( Serialize, Deserialize, Clone, Debug )]
pub struct Status {
    pub code: StatusCode,
    pub value: String,
}

#[derive( Debug )]
pub struct Database {
    _state: Firebase
}
impl Database {
    pub async fn init () -> Self {
        ...
    }
    pub async fn count_jobs ( &self, uid: String ) -> usize {
        ...
    }
    pub async fn new_job ( &self, uid: String, job: Job) {
        ...
    }
    pub async fn update_status ( &self, uid: String, job_id: usize, status: Status) {
        ...
    }
    pub async fn get_status ( &self, uid: String, job_id: usize) -> Option<Status> {
        ...
    }
    pub async fn get_job ( &self, uid: String, job_id: usize) -> Option<Job> {
        ...
    }
}
```

There are five structs we define here. 

`Database`, the most prominent, is a handle to the currently authenticated Firebase Realtime DB. Rather than authenticate each time we need to do something, we create this handle and pass it around. It also operates as a wrapper on the `Firebase` object. `Firebase` is extremely complex, and has many features that this project does not yet need. Accordingly, it makes it less complex to abstract such things away.

`Job` is a representation for an individual submission. There are multiple fields which it holds onto. Because some users may submit different data on the behalf of multiple individuals, rather than have one user with medical data that gets updated, we can have multiple of these `Job` objects.

To keep track of these `Job` objects, we create a `User` object. This contains our list of jobs, as well as a user ID that allows us to refer to a submitter with unique identification. This is especially important since the email can be different between each job.

Each `Job` has a `Status`. There are many different states a job can be in any time, which this keeps track of:

![image](https://github.com/hiibolt/hiibolt/assets/91273156/f667a57a-868d-407f-b6a9-1ada0c57a31a)

`StatusCode` is the enum for each type, and `Status` overlays a `value` field to hold data. This can be error messages, confidence scores, or many other things.

It is also worth noting that our two accessor functions `get_job` and `get_status` return `Option` types. Because there can be realistic cases where a job may not exist anymore, such as by the data being cleared from Firebase Realtime DB or AWS S3, we need to be able to have predictable logic that handles it. Such is the power of Rust!

### Email

We also need a way to send email. To do so, I have chosen to use [Cloudflare Workers](https://workers.cloudflare.com/). If you want to see an example of the code I have deployed to our Worker, you can see my article on setting it up [here](https://hiibolt.com/nodejs/npm/cloudflare/2024/04/16/emails-cloudflare.html)!

Implementation is extremely simple - fire a POST request to the Cloudflare Worker, which does the rest of the work behind the scenes. Since we are also using Cloudflare DNS and Origin Server Certificates for HTTPS, we can easily implement emails to come from our domain. This ensures that customers understand it is us by an easily recognizable and legitimate email.

```rust
...

pub fn send_email (
    to:      String,
    subject: String,
    body:    String
) -> Result<(), ureq::Error> {
    ...
}
```

Again, in the event of an error, Rust lets us easily handle this with the `Result` data type. If an email bounces, the Cloudflare Worker is down, or the email fails to send, the server can react accordingly.

### Local Computing

Because the supercomputing cluster limits access, no web servers may be hosted on it. This makes sense, as it is computationally optimized, and NIU offers web server solutions. Accordingly, to submit work, we must use SSH and run a [PBS Professional](https://altair.com/pbs-professional/) script. However, it is possible to automate this normally manual process! 

```rust
...

pub async fn query_cluster (
    user_id: String, job_id: String ,
    _aws_access_key_id: String, _aws_secret_access_key: String, _igait_access_key: String
) -> Result<(), String> {
    ...
}
```

Let's talk about what goes in this PBS script. The cluster can't recieve files by hosting a file drop endpoint. Instead, we use an ingenious method - we provide the job and user ID by launch arguments. By doing so, within the PBS script, we can download the files to then perform work on them. It is worth noting that since we can have any number of file extensions, I created a JSON file that keeps track of what Metis needs to download from S3.

```bash
# Import files
/.../.venv/bin/python /.../download_files.py "$USER_ID" "$JOB_ID" ... ... ...
ls ./queue

# Get the video dir
VIDEO_DIR="$TMPDIR/queue"

# Find the front and side videos and extract their extensions
FRONT_VIDEO=$(find "$VIDEO_DIR" -type f -iname '*front*' | head -n 1)
SIDE_VIDEO=$(find "$VIDEO_DIR" -type f -iname '*side*' | head -n 1)

# Extract the extensions
FRONT_EXT="${FRONT_VIDEO##*.}"
SIDE_EXT="${SIDE_VIDEO##*.}"

printf "EXTENSIONS: $FRONT_EXT and $SIDE_EXT"
```

However, we aren't running these in typical fashion. Because OpenPose uses so many libraries and programs to run, rather than bug the sysadmin to install them, we used Docker. There are some caveats, mainly that OpenPose needs access to the GPU. To make this happen, and to be able to run Docker without `sudo`, we employed [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) and [Podman](https://podman.io/).

Since the files are on our host operating system and not yet in our Docker container, we must also copy them there.

```bash
# Start Openpose
printf "[ :3 - Starting OpenPose GPU container... - :3 ]\n"
/bin/podman run --name openpose -t -d --device nvidia.com/gpu=all --security-opt=label=disable ghcr.io/hiibolt/igait-openpose
printf "[ :3 - Started OpenPose GPU container! - :3 ]\n\n"

# Build file structure
printf "[ :3 - Building file structure in OpenPose container... - :3 ]\n"
/bin/podman exec openpose mkdir /inputs
/bin/podman exec openpose mkdir /outputs
/bin/podman exec openpose mkdir /outputs/videos
/bin/podman exec openpose mkdir /outputs/json
printf "[ :3 - Build file structure in OpenPose container! - :3 ]\n\n"

# Import video files
printf "[ :3 - Importing video file inputs to OpenPose container... - :3 ]\n"
/bin/podman cp $VIDEO_DIR/front.$FRONT_EXT openpose:/inputs/front.$FRONT_EXT
/bin/podman cp $VIDEO_DIR/side.$FRONT_EXT openpose:/inputs/side.$FRONT_EXT
/bin/podman exec openpose ls /inputs
printf "[ :3 - Imported video file inputs to OpenPose container! - :3 ]\n\n"
```

Finally, we run the pose estimation. After the video overlays and JSON serializations of the pose estimation are completed, we pull them back out of the Docker container, and upload them to S3. 

```bash
# Run OpenPose on video files
printf "[ :3 - Starting OpenPose pose estimation... - :3 ]\n"
/bin/podman exec openpose ./build/examples/openpose/openpose.bin --video /inputs/front.$FRONT_EXT --display 0 --write_video /outputs/videos/front.$FRONT_EXT --write_json /outputs/json/front
/bin/podman exec openpose ./build/examples/openpose/openpose.bin --video /inputs/side.$SIDE_EXT --display 0 --write_video /outputs/videos/side.$SIDE_EXT --write_json /outputs/json/side
printf "[ :3 - Finished OpenPose pose estimations! - :3 ]\n\n"

# Move output to host filesystem
printf "[ :3 - Copying outputs... - :3 ]\n"
/bin/podman cp openpose:/outputs /.../
printf "[ :3 - Finished copying outputs! - :3 ]\n\n"
```

Since we do not need those videos again on the cluster, we safely delete them. Next, we take those JSON serialized pose mappings and run our inference on them. 

With our confidence score, we send a request to our AWS EC2 server, letting them know what the new status is.

```bash
# Kill  OpenPose
printf "[ :3 - Killing OpenPose... - :3 ]\n"
/bin/podman kill openpose
/bin/podman rm openpose
printf "[ :3 - Finished killing OpenPose! - :3 ]\n\n"

# Clean up files and submit confidence score
/.../.venv/bin/python /.../post_and_cleanup.py "$USER_ID" "$JOB_ID" ... ... ... "$FRONT_EXT" "$SIDE_EXT"
printf "[[ :3 - Ending job - :3 ]]"
```

### Server State

At this point, we have two handles - one to Firebase Realtime DB, `Database`; and another (not previously mentioned) to S3, `Bucket`.

When a job is submitted, the submitted files are downloaded to our AWS EC2 and placed in a folder. The existance of this folder indicates to the server that it has not yet been handled.

These two handles and the folder containing data comprise the entire state of our app. To combine the three, we create an `AppState` object which holds both handles, and a `work_queue` function. The `work_queue` function repeatedly checks the folder for new job submissions, and updates the app state accordingly.

```rust
#[derive(Debug)]
pub struct AppState {
    pub db: Database,
    pub bucket: Bucket
}
impl AppState {
    ...
}

pub async fn work_queue(app: Arc<Mutex<AppState>>) {
    ...
}
```

It is worth noting that every mention of `AppState` is wrapped in `Arc<Mutex<...>>`. Why is this?

Well, it is important to consider that each incoming request is asynchronous. In order to share data across multiple threads, you *need* to protect it. Otherwise, if **Thread 1** and **Thread 2** try to write data to the state at the same time, a [data race](https://en.wikipedia.org/wiki/Race_condition) can occur, which can be fatal for the server.

To combat this, a [`Mutex<T>` lock](https://en.wikipedia.org/wiki/Lock_(computer_science)) is used. This will force other threads to wait until the currently accessing thread is done working.

Now, Rust cares a lot about [lifetimes](https://doc.rust-lang.org/rust-by-example/scope/lifetime.html), especially for pointers. However, if multiple things [own](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) a pointer, Rust refuses to compile. This is because by default, in Rust, shared references cannot be mutable, for the same data race concern. To solve this, similarly, we create an [`Arc<T>`](https://doc.rust-lang.org/std/sync/struct.Arc.html) which allows multiple pointers to the same thing, atomically (thread-safe).

So to recap, `Arc<Mutex<AppState>>` is a thread-safe pointer that can be copied to as many places as we need.

This starts to make more sense when we see our main function, which immediately passes a second copy of our state to another thread which handles the queue worker.

```rust
...

#[tokio::main]
async fn main() {
    // Build the general app state
    let state: Arc<Mutex<state::AppState>> = Arc::new(
        Mutex::new(
            state::AppState::new().await
        )
    );

    // Build the V1 API router
    let api_v1 = Router::new()
        .route("/upload", post(routes::upload) )
        .route("/completion", post(routes::completion))
        .with_state(state.clone());

    // Nest the API into the general app router
    let app = Router::new()
        .nest("/api/v1", api_v1)
        .layer(LiveReloadLayer::new())
        .layer(DefaultBodyLimit::max(...));

    // Start the queue worker
    tokio::spawn(state::work_queue(state));

    print_be("Started iGait Backend on 3000!");

    // Serve the API
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

We can see two routes for our `routes` crate, which we haven't talked about, being hosted on a [`Router`](https://docs.rs/axum/latest/axum/struct.Router.html) with a sizeable body limit to allow large video files.

Finally, we bind a listener to port 3000, and serve our [Axum](https://docs.rs/axum/latest/axum/index.html) server to the world.

### Server Routes

Since there are two things which interface with our backend server (the frontend and Metis), we need two routes to handle both.

Firstly, we need a route which accepts a large [multipart](https://en.wikipedia.org/wiki/MIME#Multipart_messages). This route will pick apart the incoming request and upload the needed parts to Firebase Realtime DB or AWS S3. It must also return a success code (`Ok<T>`) or a fail code (`Err<T>`). This is easily handled with Rust's `Result<T, T>` type.

Notice the previously mentioned `State` being passed around - this allows the database and S3 to be handled asynchronously!

It is worth noting that since there are two files, the file save logic is handled by a helper function `save_files`.

```rust
...

/* Primary Route - Upload */
pub async fn upload(
    State(app): State<Arc<Mutex<AppState>>>,
    mut multipart: Multipart
) -> Result<(), String> {
    ...
}
async fn save_files<'a> (
    app: Arc<Mutex<AppState>>,
    _front_file_name: Option<String>,
    _front_file_bytes: Result<Bytes, String>, 
    _side_file_name: Option<String>,
    _side_file_bytes: Result<Bytes, String>, 
    user_id: String,
    job_id: String,
    job: Job
) -> Result<StatusCode, String> {
    ...
}
```

Secondly, we need a route for which the cluster can submit its report of success or error after finishing a completion. This route needs to also handle multiple fields, so we will again use a multipart request structure.

This route is more simple - since the cluster handles uploading the file to S3, this route only updates Firebase Realtime DB and sends the final emails.

```rust
...

/* Primary Route - Completion */
pub async fn completion(
    State(app): State<Arc<Mutex<AppState>>>,
    mut multipart: Multipart
) -> Result<String, String> {
    ...
}
```

## Closing Thoughts -  

With this, my work on the backend is majorly complete. I am incredibly thankful for the opportunities to work with awesome technology like AWS, Firebase, and Metis - and for such an amazing cause! 

 

It is obvious in retrospect that my undergraduate research mentor took a major risk in taking on a freshman level student. While I do consider myself a competent programmer, age is a detracting factor many recruiters refuse to overlook.  

 

Many competent programmers have no way of proving themselves - research like this is an amazing opportunity to do so! As such, I have chosen to continue to complete undergraduate research. I believe that the cause of not just this project, but academic research in general, is extremely honorable. While mine did not, much adademic research fails. But it is important to remember that without pioneers willing to take risks, it is impossible to make progress. 

 

To those who have read this far, I strongly suggest finding a project like this to work on. It does not need to be related to ASD or learning disabilities - but it should be something that you care about. The above infrastructure model is something that, had you have shown to me on Day 1 of my research, would have scared me. However, my passion for the cause allowed me to work to make the needed skills within my reach. 

*"Extropy-oriented thinkers should not fear a little extra work"*
 

## Outro -  

 

If you enjoyed this article, feel free to follow my [GitHub](https://socials.hiibolt.com/github) or check out some of my other work on this site!

 

I am forever curious, so if you have an interesting project or research idea, [let's chat](https://socials.hiibolt.com/discord).

 
