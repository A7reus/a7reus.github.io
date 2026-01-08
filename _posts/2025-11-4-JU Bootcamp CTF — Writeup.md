---
title: "JU Bootcamp CTF — Writeup"
description: "My solutions to the problems on JU Bootcamp CTF hosted by Cyber Bangla."
categories: [CTF Writeups]
tags: [Cryptography, Web, OSINT, Cybersecurity]
---

![CTF Poster](https://images2.imgbox.com/b4/b5/SzkHBt6E_o.png)

***

### Section 1: Basics

#### Problem 1: Digital Image Metadata Analysis

> While investigating digital evidence, you come across a series of JPEG image files. Although they appear ordinary at first glance, you suspect they may contain embedded metadata - such as timestamps, geolocation data, or camera details - that could link them to key events or locations.
>
> **Question:**\
> Which tool is best suited for extracting metadata from image files?
>
> **Options:**\
> A. ExifTool\
> B. Wireshark\
> C. Volatility\
> D. FTK Imager
>
> **Flag Format:** `CBCTF{C}`

[ExifTool](https://github.com/exiftool/exiftool) is the correct answer.

#### Problem 2: Email Header Analysis

> You receive a suspicious phishing email. To trace its origin, you want to analyze the "Received" headers and IP information.
>
> **Question:**\
> Which tool is best suited for analyzing and visualizing email headers?
>
> **Options:**\
> A. Autopsy\
> B. MXToolbox\
> C. Nmap\
> D. Hashcat
>
> **Flag Example:** `CBCTF{B}`

[MXToolbox](https://mxtoolbox.com/) is the correct answer.

#### Problem 3: Remove

> I need to remove a file called secret in my home directory. Which command should i use?
>
> **Flag Format:** `CBCTF{command}`

```bash
rm $HOME/secret
```

#### Problem 4: Website Footprinting

> During reconnaissance, you want to gather subdomains of a target website to identify potential attack surfaces.
>
> **Question:**\
> Which tool is specifically designed for subdomain enumeration?
>
> **Options:**\
> A. DirBuster\
> B. Sublist3r\
> C. Burp Suite\
> D. Wireshark
>
> **Flag Example:** `CBCTF{C}`

[Sublist3r](https://github.com/aboul3la/Sublist3r) is the correct answer.

#### Problem 5: Satellite Spy

> Which free service provides satellite images useful for OSINT?
>
> **Flag Format:** `CBCTF{FlagFlag}`

There can be more than one answer to this one, but [Google Eath](https://earth.google.com/web/) is the most well-known choice.

#### Problem 6: Scout

> Which search engine is designed to find Internet-connected devices?
>
> **Flag Format:** `CBCTF{flag}`

[Shodan](https://www.shodan.io/) is the answer.

#### Problem 7: Secrets

> Developers often leak sensitive information accidentally. Which platform is often searched?
>
> **Flag Format:** `CBCTF{******}`

[Github](https://github.com/) is the most logical answer to this one.

#### Problem 8: Image

> What technique helps identify the source of an image by searching visually similar ones?
>
> **Flag Format:** `CBCTF{FlagFlagFlag}`

The technique is called **reverse image search**.

***

### Section 2: Cryptography

#### Problem 1: Welcome

> Welcome
>
> Q0JDVEZ7d2VsY29tZV90b19jYmN0Zn0=

Clearly, we're given a cipher text. I used [dcode.fr](https://www.dcode.fr/cipher-identifier) as a tool for both cipher identification and decoding.

decode.fr identifies the given text as a `Base64` cipher. Decoding it yields:

```none
CBCTF{welcome_to_cbctf}
```

Which is the target flag.

#### Problem 2: BASE

> Can you decode the hidden message ?
>
> VTJ4V1JGWkZXamROVmpselRVaFplbGd5U1RCT1ZFNW1UbXBTT1E9PQ==

This one is also a `Base64` cipher. Decoding it yields another `Base64`, and decoding which yields yet another `Base64` cipher. After 3 steps of decoding using the same `Base64` coding, we get:

```none
JUCTF{1_l0v3_b453_64}
```

Which is the flag.

#### Problem 3: আহারে…………………… 🥲🥲🥲

> আমার এই দুই যুগ, অর্থাৎ ২৪ বছর বয়সে, বহুবার ট্রেনে ওঠা হয়েছে এবং বিভিন্ন জায়গায় বেড়ানো হয়েছে। তবে এক দেশ থেকে অন্য দেশে ট্রেনে করে কখনো যাওয়া হয়নি।
>
> CCFbaoyugti}BT{rv\_o\_o\_t

*Haven't yet solved.*

#### Problem 4: relax

> Decode this\
> zna\_vf\_cbjreshy
>
> **Flag Format:** `CBCTF{flag}`

After trying a couple of encodin methods detected by decode.fr, we get the following from `ROT-13` decoder.

```none
man_is_powerful
```

Which is the flag, provided that the answer format is maintained.

#### Problem 5: Meaty Signals

> We found a strange message written using symbols like '@' and '^'.\\
>
> At first glance, it looks meaningless - but something tells us there's a pattern. We heard the sender is a fan of classic ciphers and hides messages using only two symbols. They claim the message contains a hidden flag. Can you figure out the method and decode the original message?
>
> @@@^@ @@@@^ @@@^@ ^@@^@ @@^@^ @@^^^ @^@@@ @@@^^ @@@^^ @@^@@ @^^@@ @^@@@ ^@@@^ ^@@^@ @@@@@ ^@@@^ ^@@^@ ^@^^@

This s a `Bacon` cipher. Upon decoding, one of the following should be the answer format.

```none
CBCTFHIDDENISTASTY
CBCTF{HIDDENISTASTY}
CBCTF{HIDDEN_IS_TASTY}
```

None of them were accepted, quetion might be rigged.

#### Problem 6: BrainF\*\*k

> This cryptic text doesn't follow the rules of traditional ciphers,it feels more like a language crafted by programmers. Unusual? Definitely. Secure? Perhaps. Your task: decode the madness, break through the abstraction, and uncover the hidden flag. Can you crack the code before it cracks your mind?
>
> ++++++++++\[>+>+++>+++++++>++++++++++<<<<-]>>> - -.-.+.> - - - - - - - - .<+++.>+++++++++++++++++++++++++++++++++++++++. - - - - - - - - - - - - -.++++++++++++++++.← - - - - - - - - . - -.> - - .<+++++++++++++++++++++.> - - - - - - - -.++++.++++++++. - - - - - - .<<+++++++++++++++++++.>>++++++++++++++++++++. - - - - - - - - - - .++++++++++++++++++++++++.<<++. - .>> - - -. - - - - - - - . - - -.+++++++++++++++++.<<-.>>+++++++.<<+++.>> - - -. - - - - - - .+++++++++++++++.<←.>>++++++++.

This one is one of the easiest problems, since the answer is in the question itself. The text is acually code written in the programming language `Brainfuck`, and executing it through an online compiler yields the flag:

```none
CBCTF{br41nF_ck_1s_w31rd_p0w3rfu1}
```

#### Problem 7: Keyboard Ninja

> The message below has been encoded by shifting each character to another key on the keyboard. VNVYG}l4un-stf+v2\[j4t+2d+gim|
>
> **Flag Format:** `CBCTF{********}`

Shift each character by a key to the left (according to keyboard layout), and the flag is decoded.

```none
CBCTF{k3yb0ard_c1ph3r_1s_fun}
```

#### Problem 8: Librarian's Secret

> Long ago, in a forgotten archive of Cyber Bangla's old server,a message was left behind, encrypted by someone known only as Emran. He wasn't just a librarian; he was the guardian of secrets, a master of codes. Before he disappeared, he left a final message, and like always, he used his favorite cipher, and signed it in his own way.
>
> GNTTS{lmtk\_jsdcd\_gspry\_lsg\_nia}
>
> **Flag Format:** `CBCTF{flag}`

This one's encoded using `Vigenere` cipher, and the key used is `EMRAN`, which is the given name of the lirbarian. Decoding using the key, we get:

```none
CBCTF{hack_world_today_you_win}
```

#### Problem 9: Dots & Dashes

> A secret message is hidden using just dots and dashes. Can you decode this classic communication method and find the flag?
>
>  - .. - - - . ..-. … - .. - .- … - .- . - . - - - - .- . - - .- - .. - .- . - - ..-. .. - .- - - - -. - - .- .. - .- - - …. - . .. - .- - - - - -. - - .-

*Haven't yet solved.*

***

### Section 3: Web

#### Problem 1: Get The Flag

> Just get the flag.
>
> **Flag Format:** `CBCTF{flag_here}`

Upon visiting the given site URL, we're presented with the following text:

```none
You might not GET it. So what would you do?
```

This line hints that the problem has something to do with `HTTP` request methods. Since a `GET` reqeust doesn't give us the answer, let's try to send a `POST` request next.

```bash
curl -X POST <URL>
```

And the flag can be found within the HTML returned by the server.

```html
<div class="flag">
  Congratulations! Here's your flag:
  <b>CBCTF{YeAh_Y0u_P0St_iT}</b>
</div>
```

#### Problem 2: Secret Note

> Notes are private and meant to stay hidden. Read someone else’s secret.
>
> **Flag Format:** `CBCTF{flag}`

Upon visiting the given site, two things are clear:

* There is no authentication going on.
* Server depends on the query parameter `id` to retrieve information, which can be altered by the client.

Upon setting `id=2` on the query parameter, we get the desired flag.

```none
Username admin
Role admin
Email admin@admin.com
Note Restricted profile. You should not be able to view this directly.
Flag CBCTF{4ccess_The_@dmin_!nfo}
```

#### Problem 3: Get The Flag 2

> Get the flag again but this time you might need to request the flag.
>
> **Flag Format:** `CBCTF{flag}`

At first glance at the given site:

```none
You might not GET it. So what would you do? It's not the same. Try requesting the flag.
```

The first thing that comes to mind is sending a `request body` with the `POST` request. After trying some combinations, this request worked:

```bash
curl -s -X POST 103.40.156.214:8050 -d "flag=true"
```

And is flag is in the response `HTML`:

```html
<div class="flag">
  Congratulations! Here's your flag: CBCTF{Y3AH_Y0U_P0SteD_iT_WiTh_Fl4G}
</div>
```

#### Problem 4: Sneaky Search

> The search box shows what you type. Make it do a trick when the results appear.
>
> **Flag Format:** `CBCTF{flag}`

This one has an `XSS` vulnerability. All we have to do for the flag is input `flag` and submit.

```none
🎉 You got the flag: CBCTF{C00k!e_Hij@cked_vi@_X$$}
```

***

### Section 4: OSINT

#### Problem 1: Where Hackers Meet

> I’m a legendary cybersecurity conference held every August in Las Vegas. Hackers from all over the world gather under one roof — but don’t bother bringing your credit card, I only deal in cash. Who am I?

[DEF CON](https://defcon.org/).

#### Problem 2: Elephant

> Abdullah Al Naowal Dhrubo recently posted an image of an elephant he drew himself. At first glance, it looks like a simple art post — but the caption seems unusual. It contains a strange string of random letters and symbols.
>
> JUCTF{flag}

Navigating to the said person's facebook account, we do see a post with a drawing of an elephant, along with a caption that looks like a `Base64` ciphertext.

Upon decoding, we get:

```none
Hint: It's good to make changes in life every now and then.
```

Which is clearly not the flag. Upon further inspection, it seems that the post has been edited. The edit history helps us find the original version of the post, which contains the ciphertext that actually contains our flag. Decoding it yields:

```flag
JUCTF{yeaaa_you_the_flag_base64}
```

#### Problem 3: Domain Digger

> One of my friends performed terribly in a recent CTF event, let’s call it examplectf.com.
>
> Frustrated by the loss, he came to me and said: "I want revenge! Find out who runs this CTF. Get me the registration info, anything you can dig up."
>
> Can you help him?
>
> **Flag Format:** `CBCTF{Registry Domain ID}`

This one tool some trial and error, but running the following command managed to spot the flag.

```bash
# CBCTF{2592662472_DOMAIN_COM-VRSN}
whois examplectf.com | grep "Registry Domain ID"
```

#### Problem 4: Do you know Mrrexnomi?

> Need to search the user and find the hidden message.

Obvious course of action: google `Mrrexnomi`. After digging the guy's social media accounts a bit, we find the following in the `About` section of his linkedin:

```none
Recently, my team visited CTF Finance Centre area and dropped a message. Please find out this "https%3A%2F%2Ftextbin.net%2F4ehjkdza4a"
```

It's a `textbin` link, and the id is pretty predictable from looking at the text. We can format the link as `https://textbin.net/4ehjkdza4a`. Visiting the site gives us the flag:

```none
JUCTF{Cyb3r_Bang1a_Teams}
```

#### Problem 5: Exif Escape

> An image was anonymously uploaded to a public forum, claiming it was taken "somewhere in South Asia".But OSINT never lies and metadata tells a different story. We extracted this file before it was deleted. Can you investigate and find the real location?
>
> **Flag Format:** `CBCTF{Place Name_City_Country}`
>
> hq720.jpg

*Haven't yet solved.*
