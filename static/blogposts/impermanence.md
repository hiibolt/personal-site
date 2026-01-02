---
title: Impermanence - In Search of Pure State
description: Epheremal state by default leads to declarative thinking, a well-defined system, and complete understanding of your machine. 
slug: impermanence
date: 2024-07-04 09:59:51-0600
image: https://www.datapred.com/hubfs/seasons.jpg
categories:
    - Blog Post
tags:
    - Nix
    - NixOS
    - Impermanence
    - State
---

How many commands have you run to get your Linux systems to the state they are? Take a moment, and try to picture a number. For a casual user, it might be anywhere from 5-100 commands. For a developer, it might be closer to 200-300 commands - and for a power user on a tricked-out machine, it's probably close to a thousand or more.

For example, on Ubuntu, it takes:
- [4](https://code.visualstudio.com/docs/setup/linux) commands to install Visual Studio Code
- [9-10](https://docs.docker.com/engine/install/ubuntu/) commands to install Docker
- [5-11](https://beebom.com/how-install-drivers-ubuntu/) commands to install Nvidia drivers (but let's be realistic, probably a lot more)

These commands which a superuser runs over time to install software, configure programs, etc, they build what's called your system's **state** - the current condition of your system.

Commands such as these are known as **imperative** configuration. This creates a type of state that is described as *"how-to-get"* - meaning to get, say, Nvidia drivers installed, one must remember how to get it with a series of commands.

So, what's wrong with imperative configuration, after all, everybody seems to do it? A great question. Who am I, after all, to challenge tried-and-true approaches?

Well, let's consider a slightly ficticious scenario. [Spells-R-Us](https://github.com/hiibolt/spells_r_us), your local spell store, runs their entire infrastructure on a [Dell Poweredge 830](http://www.dell.com/downloads/global/products/pedge/en/830_specs.pdf), which was first produced in the grand year of 2005. Since its first day of deployment, it's seen three sysadmins. Unfortunately, they recently fired the third for sleeping on the job (after bringing him in for late-night emergency maintenance 6 days in a row) and burned every bridge with him in the heated debate that ensued.

The third sysadmin warned them:
> "It might seem like you hired me for nothing for a few weeks, maybe even months if you're lucky. But don't come crawling back when - and I mean when - all hell breaks loose!"

And sure enough, 2 weeks later, a power outage fried the server. The entire e-commerce storefront crumbled with a pop. Bob, the new sysadmin, stares at the now ruined server in shock. He's going to be expected to bring 20 years of un-documented, un-serialized, and entirely imperative state back together. Sorry Bob, might wanna start figuring out your favorite flavor of Monster.

## The Issues With Imperative State - 
So the problem is obvious, right? You have a server, you need to run commands to get it to a certain state, but you struggle to remember them. So maybe write them down, ya idiot?

Well, it can in fact be that simple. Writing these commands down can often be the solution for many less complex system states, but there are three major issues that hold a **serialized imperative state** back - especially on more complex or dated systems.

### Issue 1 - Length
Unsurprisingly, they get long. Very, very long. It's not uncommon to see `install.sh` files in the thousands of lines for one program or [Ansible playbooks](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html) capable of crashing even the most beefy of text editors.

This is an issue for a lot of reasons. Legibility and transparency are difficult - who wants to read all that? Then, consider how one tests such a thing. You're telling me I need to wait for over 3000 commands to execute on a VM just to verify I spelled a command right?

### Issue 2 - Updates
It's not uncommon for commands to change over time or to see arguments get depreciated. When these things do happen, one must parse through their entire list to fix it - and you often won't know these things happen until the list no longer works.

It's also worth considering the many types of dependency conflicts. Imagine that you need to update VSCode, but you get an error - you need the latest version of GCC. Well, okay, you notate the commands needed to update GCC. But wait no, actually, you need to go back and update the original commands that install GCC to instead install the new version.

Wait, can I do that? Does everything support an updated GCC? I sure hope so.

Oh. May God save us all, it needs me to update Electron too.

### Issue 3 - Imperfect Serialization
Okay, I know I've already used it as an example twice now, but imagine you're installing Nvidia drivers. In typical Nvidia driver installation fashion, it doesn't work the first way. Or the second. Or the third, fourth, or fifth. 

So, you try the first way, one last time. And magically, it works. Did you mistype something the first time? Did one of the other commands cause a [side effect](https://en.wikipedia.org/wiki/Side_effect_(computer_science)) that fixed it? How on earth do you serialize that process?

Well, one option is to simply write:
```bash
# Install Nvidia drivers. Good luck!
```

And although this may come as a surprise, the above is a very valid approach! If a command list tells a sysadmin *"how-to-get"* to a state, then this is *"what-to-get"* to as a state. As previously mentioned, the *"how-to-get"* approach is **imperative**, and this *"what-to-get"* approach is a new term - **declarative**.

## Declarative Configuration - 
Generally speaking, a declarative approach is usually more abstract than imperative, which makes sense if you consider its nature. In fact, when reading through the below goals, those of you who enjoy [functional programming](https://en.wikipedia.org/wiki/Functional_programming) will likely feel at home.

The goals of declarative thinking are simple.
- Explain **what needs to get done**, but *not* how to do it
- Prioritize **immutability** and avoid side effects 
- Express the logic needed with **proper constraints**

There are quite a few declarative configuration solutions, but I'm highly particular to the [Nix Package Manager](https://nixos.org/). It's a declarative package manager that allows you to perfectly describe what you're looking for, but not necessarily how to get it - you let Nix take care of that.

For example, below is a [Nix Flake](https://nixos.wiki/wiki/flakes) that specifies a great starting environment for working with my favorite language, [Rust](https://www.rust-lang.org/). Don't beat yourself up trying to understand the syntax if it's your first time seeing Nix, I'll explain it in just a second :)

```nix
{
    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-24.11";
        ...
    };
    outputs = { self, nixpkgs, flake-utils }: 
        ...
        let
            pkgs = import nixpkgs { inherit system; };
        in
        {
            devShell = pkgs.mkShell {
                buildInputs = with pkgs; [ cargo rustc rustfmt rust-analyzer clippy ];
                RUST_SRC_PATH = pkgs.rustPlatform.rustLibSrc;
            };
        }
        ...
}
```

We see that it describes two things - inputs and outputs. Our sole input is [`nixpkgs`](https://search.nixos.org/packages), the world's largest package repository. Specifically, we're locking it to the 24.11 stable release of `nixpkgs`.

Next, let's look at the outputs. Firstly, we "create our own `nixpkgs`", so to speak, with the line below:
```nix
pkgs = import nixpkgs { inherit system; };
```

What this translates to is "here's my system, do with this information as you will." For example, consider that on different architectures how commands, available packages, and CPU languages can vary. This gives Nix what it needs to make decisions based your system's configuration.

But, the above is actually just a local variable - not an output! We can see our output is a `devShell`, which is exactly what it says on the box. We specify that we want two things in our development shell: a set of build input packages to help us develop, `buildInputs`, and to set the Rust source path to the correct value.

For comparison, I installed the above imperatively - it was roughly 25 commands, and including the quick searches it took to find them, and took me about fifteen minutes. With Nix, I ran `nix develop` and was ready to roll in about a minute - effectively just the necessary time to install the Rust toolchain.

But who cares about the speed - what are the benefits of doing it this way? After all, it requires learning the Nix language, a task that requires time and effort. There are so, so many benefits, but I'd like to focus on just two:

### Benefit 1 - System Agnosticism
As previously mentioned, this is **system agnostic**. Since no specific commands are notated, Nix gets to take care of how it all happens.

For example, on an `aarch`-based system, it'll get `aarch`-based packages, and on an `x86-64`-based system, it'll get those packages.

This solves a particularly horrifying problem - "it works on my machine".

### Benefit 2 - Constraint Control
One of the most useful features of declarative configuration highlighted by Nix is **control via constraints**.

For example, we can specify the version of `nixpkgs` and the version of the package. You can specify it down to the hash of the package if you'd like, but even if you don't, Nix will hash-lock it for you in a `flake.lock` file. 

This solves the problem of setting up your environment on a machine a few months after original setup, when packages have recieved updates. Breaking changes often occur in packages, and your environment wouldn't be exactly as you expect it to be. Blasphemy!

As a simple remedy, Nix doesn't update packages unless you ask it to. It finds the *exact* package described by the nixpkgs version; system; and the package name, version, and hash - so you get the same stuff you're used to, **every time**.

## Partially Declarative State - 
But, you say, "that's not state, that's just configuration!" And you'd be right, it's not - but it can be.

Enter [NixOS](https://nixos.org/), which allows Nix to define an *entire operating system* to be an output of a Nix derivation, no different than our `devShell` derivation output from before.

An outrageous claim - nothing but nonsense spewed by a declarative heratic. An operating system built on the fly by a package mananger? That's absurd. And yet, it's possible:

### `flake.nix`
```nix
{
  inputs = {
    nixpkgs = { url = "github:nixos/nixpkgs/nixos-24.11"; };
  };
  outputs = inputs@{ nixpkgs, ... }:
  let
    system = "x86_64-linux";
    pkgs = import nixpkgs {
      inherit system;
      overlays = [ ];
      config = globalPkgsConfig;
    };
  in
  {
    nixosConfigurations.default = inputs.nixpkgs.lib.nixosSystem {
      inherit system;
      modules = [
        ./configuration.nix
      ];
      specialArgs = { inherit inputs; };
    };
  };
}
```

And this, my friend, is an entire operating system. It's hash-locked as a Nix Flake, specifies a `nixpkgs` version and system, and allows for a seperate `configuration.nix` file to specify what the system should contain. Let's take a look at that now:

### `configuration.nix`
```nix
{ config, pkgs, ... }:
{
  imports = [ ./hardware-configuration.nix ];

  boot.kernelPackages = pkgs.linuxPackages_6_1;
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
  boot.loader.efi.efiSysMountPoint = "/boot/efi";
  boot.loader.grub.configurationName = 15;

  networking.hostName = "nixos";

  services.xserver.enable = true;

  services.xserver.displayManager.gdm.enable = true;
  services.xserver.desktopManager.gnome.enable = true;

  services.xserver = {
    layout = "us";
    xkbVariant = "";
    xkbOptions = "grp:alt_space_toggle";
  };

  sound.enable = true;
  hardware.pulseaudio.enable = false;
  security.rtkit.enable = true;
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    alsa.support32Bit = true;
    pulse.enable = true;
  };

  users.users.hiibolt = {
    isNormalUser = true;
    description = "hiibolt";
  };

  system.stateVersion = "24.11";
}
```

Believe it or not, these 40 lines of code build and install an *entire operating system* with GNOME, a pre-configured user, and some other personalization. Notice that there isn't a single command written here - just constraints. And Nix will build the same system, **every single time**.

It's impossible to understate how amazing this is. Your entire operating system, in a set of human-readable text files, which can be modified and tracked via version control!

Let's recount what brought us here. In search of a declarative and pure system state, we've employed a solution that allows us to serialize a large majority of a system's state in the form of hardware, daemon, package, and system configuration. This allows us to *almost* get our exact system on a fresh install. But wait, *almost*?

## Purely Declarative State - 
Yes, *almost*. Let's say that you perfectly define all the applications you like, system options, and you rice your system with some seriously slick KDE configuration.

Well, as you install applications, even through Nix, you collect additional - and undeclared - state. For example, when you install [Fish](https://fishshell.com/) (the best shell, btw) - you now have a `config.fish` file in your home directory. When you install Firefox, each new extension and setting change is reflected in your home directory. Over time, even with a largely declared system, you accrue "crud".

I realized this when I had a full RAID failure on my server. Enough drives failed for parity-based recovery to be impossible, and I thought - "no worries, I'll just pull my NixOS config from GitHub and be good to go!"

And, actually, this was pretty true - I had *most* of my system back in seconds. Then, I launched a terminal and realized that my [Tide](https://github.com/IlanCosman/tide) customization was gone. My background - gone, my browser extensions - gone, all of my repositories, documents, all gone. Especially painful to bring back online was my [Servarr](https://wiki.servarr.com/) stack, which is primarily configured via GUI.

This was a defining moment for me, because I was expecting to be back up and running in minutes. A large portion of persistant state - application options, Linux ricing, and more simply can't be safely captured in a NixOS configuration - or so I thought.

### Erase Your Darlings
A violent name, right? Well, it's fitting - what's discussed below, [`impermanence`](https://nixos.wiki/wiki/Impermanence), is a nuclear solution of the highest degree. The concept is extremely simple.

*Everything is wiped on boot*.

But how will NixOS boot? Great question! Well, `impermanence` operates on a whitelist basis, and NixOS effectively needs but two folders to boot. Firstly, `/boot`, which is likely unsurprising and self explanatory. Second, NixOS likes to have `/nix`, which contains the immutable definitions of our system and its dependencies. So we effectively need to only whitelist these two folders to ensure NixOS has what it needs. 

> *For the record, NixOS doesn't even technically need these! NixOS is perfectly comfortable with an empty root - the install media starts this way.*

And, considering that these folders are generally immutable and only edited by NixOS during a rebuild, they make sense to leave persistent on boot.is This is because they'll always be built almost - if not exactly - the same way by building our flake-locked `nixosConfiguration`.

"But", you say, "this doesn't solve our issue, our config still disappears with a fresh install!" Once again, you'd be correct to say this. The concept of an impermanent state is actually optional, but it enforces the mindset of pure declaration. If you fail or forget to find a way to serialize configuration, you'll be harshly reminded of your failure when you restart to an un-configured Firefox.

And a lot of you might be thinking - couldn't this be problematic? What if you're working on something extremely important, and before you can save, you accidentally hit the power button as you finish. You start your system up, and it's gone! Oh, the horrors. 

Just kidding! With the power of [BTRFS snapshots](https://btrfs.readthedocs.io/en/latest/Subvolumes.html), you can automatically "back up" your entire filesystem to prevent this issue. For example, if you were to accidentally restart your machine or a freak accident occurs, you can inspect the previous subvolume to find the file that you need, and can trivially copy it over.

> *BTRFS subvolumes aren't trivial to set up, however - I highly recommend watching [Vimjoyer's video](https://www.youtube.com/watch?v=YPKwkWtK7l0) for a fairly complete guide. There are some tweaks reqiured to make it happen as the video script isn't perfect, but the top comment contains a list of necessary changes.*

> *Additionally, if you would like to view additional resources about this process, I list all sources at the end of the article. Among them are other guides for BTRFS/non-BTRFS impermanence implementations.*

So let's look at what actually allows you to effectively declare *everything* about your system's state!

### `home-manager`
Recall our past example with the Fish shell. Our system gathers a wasteland of [dotfiles](https://www.freecodecamp.org/news/dotfiles-what-is-a-dot-file-and-how-to-create-it-in-mac-and-linux/) over time, and we need to be able to declare these to prevent them from dispapearing on boot. 

Well - they're gonna disappear anyway, we aren't adding them to our `impermanence` whitelist. Instead, we'll be using an extremely useful NixOS module adequately named [`home-manager`](https://nixos.wiki/wiki/Home_Manager) to manage our configuration.

This incredibly powerful tool has a lot of use cases - allowing non-root users to configure their homes, installing software declaratively in a user context, and serializing user configuration. We'll be doing the last, which allows us to track many of our important dotfiles with our NixOS configuration.

For example, if I place my Fish configuration file into my NixOS configuration folder, I can then ask `home-manager` to populate it on boot:

```nix
home.file = {
  ".config/fish/config.fish" = {
    source = config.fish;
  };
};
```

...and just like that, Fish is back up and running on a fresh install with zero setup. Legitimately amazing stuff, but what about my background? What about my rice config, bro?! Fear not.

### `plasma-manager` and `stylix`
I'm a big fan of KDE Plasma 6. It's beautiful if done right, fast, and extremely customizable. However, `home-manager` doesn't cut it for desktop configuration serialization, because Plasma makes it complicated. So, as an extension of `home-mananger`, the Nix community created [`plasma-mananger`](https://github.com/nix-community/plasma-manager).

This amazing tool lets you configure your desktop declaratively - I use it to specify virtual desktops; snap-tiling dimensions; and all the normal configuration like keybinds, default brightness, audio levels, shortcuts, widgets, and more.

However - that's not a fully riced system. You want themes, and [`stylix`](https://github.com/danth/stylix)'s got you covered and more. It supports a huge majority of common applications, and lets you globally apply popular `base16` color schemes - or even generate one from your background image, something that I'm a huge fan of.

Between the system configuration and global themeing of `plasma-mananger` or `stylix`, you can creating an *unbelievably* styled system entirely declaratively. For example, these pictures were taken directly after a fresh install from scratch, with absolutely *zero* configuration:

![image](https://github.com/user-attachments/assets/619f39ba-9237-43a0-8410-93e1924dd682)
![image](https://github.com/user-attachments/assets/2c789cc4-3db1-42d6-9715-0e5656619275)
![image](https://github.com/user-attachments/assets/9316ee93-1018-444c-b386-3bc4a4dbba72)

## Closing Thoughts
So is this approach of complete declaration for everybody? Absolutely not. In total fairness, it's impractical at best for the average user not prepared with the technical knowledge to create and maintain an impermanent system.

But, for somebody up for the challenge? The payoff is unbelievable. I've never felt more in sync with my machine and I've never had a more organized system in my life. I know what parts of all of my installed software are ephemeral, because I know it's what's not persistant - and I have full control over every part of what makes the cut. I know how and where configuration for every single application is stored, and as a result, I've learned a ton about niche configuration options that have elevated my workflow's efficiency drastically.

But most importantly my system is **completely bulletproof**. 

I recently had the NVME drive on my laptop entirely fail on me, and to get my system back to what it was required:
- Booting NixOS install media,
- Pulling my NixOS configuration,
- ...And building it.

That's it.

With this approach to state, my system has never broken, and I expect it never will - without modification, of course. 

I have the privilege of booting every day, knowing that **my system will work exactly as expected**.

## Outro and Resources
I hope you found this article informative or helpful, I'm very passionate about this topic! If you liked this article or any of my other work, feel free to follow my [**GitHub**](https://socials.hiibolt.com/github).

I write a lot about various techy things I like, so feel free to check out some of my other stuff ^^

Below you can find all resources used in writing this article:
- ["Erase Your Darlings" - Graham Christensen](https://grahamc.com/blog/erase-your-darlings/)
- ["Impermanent Nixos" - Will Bush](https://willbush.dev/blog/impermanent-nixos/#the-plan)
- ["NixOS as a Server, Part 1: impermanence" - Guekka](https://guekka.github.io/nixos-server-1/)
- ["Impermanence" - NixOS Community Wiki](https://nixos.wiki/wiki/Impermanence)
- ["impermanence" - @nix-community](https://github.com/nix-community/impermanence)
- ["Imperative vs. Declarative" - G4G](https://www.geeksforgeeks.org/difference-between-imperative-and-declarative-programming/)
- ["plasma-mananger" - @nix-community](https://github.com/nix-community/plasma-manager)
- ["stylix" - @danth](https://github.com/danth/stylix)

...and lastly, you can find my own configurations below!
- [NixOS Configurations - Multi-device Nix Flake](https://github.com/hiibolt/nixos)
- [Minimal impermanence + home-mananger + disko configuration](https://github.com/hiibolt/nixos/tree/release-micro)