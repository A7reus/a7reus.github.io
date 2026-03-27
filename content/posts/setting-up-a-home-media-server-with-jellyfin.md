---
title: "Setting Up a Home Media Server with Jellyfin"
date: "2026-03-27"
description: "Dare I say it is better than Netflix out of the box?"
category: "Projects"
tags: ["Media Server", "Self-hosting", "Linux", "Docker", "Systemd", "FOSS"]
author: "A7reus"
---

## Overview

Setting up a media server means centralizing and streaming your own media without relying on internet connectivity or streaming service subscriptions.

[Jellyfin](https://jellyfin.org/) is my personal favorite solution to a media server because it's open source, free in its entirety, and doesn't have any telemetry or online accounts. It truly puts you in control of your media with no strings attached.

It would make sense to self-host a jellyfin server on a VPS in case of broad usage, but in this blog, I'll walk through the process of how I set it up on my home network. The process would be identical on a VPS.

## Prerequisites

Before starting the setup, we need to clarify some specifications that we're going to use.

- I'm on ArchLinux, therefore the packages I use will be installed through `pacman` from the arch repositories. You need to find equivalent packages for your own environment.
- To keep the server isolated from the rest of the system, I thought it'd be a good choice to use a [docker](https://www.docker.com/) container.
- The setup will be accessible from my home network (LAN) only.
- My server has an intel iGPU, so I'll be relying on Intel QSV/VAAPI hardware transcoding.

## Install and Configure Required Tools

Using `pacman`, let's install the packages `docker` and `docker-compose` for running our docker container. Then, enable docker as a `systemd` service.

```bash
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker
```

In order to run `docker` without `sudo`, we can add our user to the `docker group` and apply the group change to the current session.

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Next, let's install the userspace drivers so that jellyfin can use VAAPI to talk to our intel iGPU.

```bash
sudo pacman -S intel-media-driver libva-utils
```

Verify it works:

```bash
vainfo
```

We should get a list of VAEntrypoints. If we do, the iGPU is ready.

Next, let's check what our render device is called.

```bash
ls /dev/dri/
```

Typically there will be `card0` and `renderD128`. We need the latter.

## Create the Directory Structure for Jellyfin Container

Now, we choose locations for Jellyfin's config, cache, and our media. Here's what I did:

```bash
mkdir -p ~/.config/jellyfin # for config
mkdir -p ~/.cache/jellyfin  # for cache
mkdir -p /mnt/data/media    # for media storage
```

## Write the Docker Compose File

`docker-compose.yml`

```yml
services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    restart: unless-stopped
    network_mode: host

    environment:
      - JELLYFIN_PublishedServerUrl=http://<your_LAN_IP>:8096

    volumes:
      - /home/and/.config/jellyfin:/config
      - /home/and/.cache/jellyfin:/cache
      - /mnt/data/media:/media:ro
      - /mnt/data/.films:/films:ro

    devices:
      - /dev/dri/renderD128:/dev/dri/renderD128

    group_add:
      - "984"
      - "988"
```

At the very beginning, we're specifying the docker image to pull from dockerhub. Then, we're giving the container a name. The line `restart: unless-stopped` makes sure our server container doesn't go down even if the server is rebooted. As long as the `docker` service is up, our server will come back alive when the server is powered on.

> `network_mode: host` means jellyfin binds directly to our server's network interfaces. Hence, no port forwarding headaches for a local setup.

Then, I specify the server IP to be my LAN IP, and the port to be `8096`, which is jellyfin's default port.

In the volumes section, we simply map the previously created directory structure to the container's internal directories.

> The reason I added `/mnt/data/.films` is because I usually keep my media there and I'm going to symlink my original media to the `/media` folder for convenience, since jellyfin follows a strict naming convention. Feel free to skip this line if it doesn't apply to you.

Next, I specify the `renderD128` for transcoding use. Lastly, the group ids for `video` and `render` are added, so the container can stream media without issue. To get the ids, run:

```bash
stat /dev/dri/renderD128 | grep Gid && getent group video
```

## Start the Jellyfin Server

From wherever the `docker-compose.yml` file exists, we run:

```bash
docker-compose up -d
```

Optionally, check if it started cleanly:

```bash
docker-compose logs -f
```

If we want to shut the server down, we will run:

```bash
docker-compose down
```

## Enter Web UI and Run Initial Setup

Let's now nagivate to `http://<server_IP>:8096` on any device on the local network. The setup wizard will run through:

1. Creating an admin account.
2. Adding media libraries. Make sure to point them to `/media`, since that is where your media will be stored.
3. Lastly, create at least another account for consumers' usage and grant it limited access. Disable media CRUD privileges for this user for safety.

## Enable Hardware Transcoding

Once logged in as admin:

1. Go to **Dashboard -> Playback -> Transcoding**.
2. Set **Hardware acceleration** to **Video Acceleration API (VAAPI)**.
3. Set **VA-API Device** to `/dev/dri/renderD128`.
4. Enable the codec checkboxes relevant to the hosted media (`H264` and `HEVC` are recommended at minimum).
5. Click save.

## Sequel

The walkthrough is essentially over, but I'd like to show something cool that I did in my personal setup.

I usually keep my movies and series in the `/mnt/data/.films` directory, and moving them to my server's `/mnt/data/media` directory would require me to either stop seeding them or go through the tedious process of manually changing the location of every media that I move. Not to mention, jellyfin has strict naming convension to ensure proper detection and metadata fetching, which means I'll also need to rename them. Copying them would require twice as much storage.

So instead, of any of those methods, I decided to use symlinks. Basically, I use the path of my original media `/films/<some_movie>.mkv` as the source of the symlink, and I use `/mnt/data/media/<some_movie>.mkv` as my symlink file. Now, why did I use `/films` instead of `/mnt/data/.films`? Because from the container's perspective, it is the former. When it'll look for the source of the symlink, it'll look into the `/films` folder, because it doesn't recognize my server's environment. It's an isolated container.

For series, it's a bit more work, but not having to move my original media makes it worth it. For example, I used this script to symlink all the files in the series [Hannibal](https://www.imdb.com/title/tt2243973/). I'm using `shows/` folder inside `/media` to store series.

```bash
#!/bin/bash
set -e

BASE_SRC="/films/Hannibal.S01-S03.1080p.BluRay.x265-RARBG"
BASE_DST="/mnt/data/media/shows/Hannibal"

for season in 01 02 03; do
    src_dir="${BASE_SRC}/Hannibal.S${season}.1080p.BluRay.x265-RARBG"
    dst_dir="${BASE_DST}/Season ${season}"
    mkdir -p "$dst_dir"

    for ep in $(seq -w 1 13); do
        src_name="Hannibal.S${season}E${ep}.1080p.BluRay.x265-RARBG"
        dst_name="Hannibal S${season}E${ep}"

        ln -s "${src_dir}/${src_name}.mp4"    "${dst_dir}/${dst_name}.mp4"
        ln -s "${src_dir}/${src_name}.en.srt" "${dst_dir}/${dst_name}.en.srt"
    done
done

echo "Done."
```

As you have guessed, this script obvoiusly doesn't work exclusively for every series. It needs to be tweaked depending on the directory structure of the original content and the naming convension it follows. But it's simple enough for the trouble it saves me.
