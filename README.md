![alt text](./docs/assets/hero-logo.png "@Google_itBot's logo ")

# @Google_itBot Telegram Inline BOT

## **This bot is working at [@Google_itBot](https://tele.click/Google_itBot)**

## What can this bot do?

This bot can search web in inline mode and share founded links. Also you can specify what to search: images, videos or the web.

## Simple usage example

### **Search and share links**

![alt text](./docs/assets/web_search_preview.gif 'Web search with @Google_itBot GIF')

### **Search and share images**

![alt text](./docs/assets/images_search_preview.gif 'Images search with @Google_itBot GIF')

### **Search and share videos (YouTube)**

![alt text](./docs/assets/videos_search_preview.gif 'Videos search with @Google_itBot GIF')

## How to configure?

In production all configuration variables should be stored in environment variables.

In development configuration variables can be stored in `.env` file. Then they will be loaded using dotenv.

See `.example.env` for details about config variables.

## Does it have limits?

Yes, this bot have limitations on requests per day/hour, as it's using Googles' Custom Search Engine API and YouTube Data API. Each of those has its limitations on requests.

**IF YOU NOTICE ANY BUG/UNEXPECTED BEHAVIOR PLEASE REPORT AN ISSUE!**
