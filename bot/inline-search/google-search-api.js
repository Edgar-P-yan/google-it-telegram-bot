const { google } = require('googleapis');
const htmlEntities = require('he');
const customSearch = google.customsearch('v1');

const [apiKey, engineId] = [process.env.GCS_KEY, process.env.GCS_ENGINE_ID];
const resultsPerPage = 10;

module.exports.googleSearch = async function googleSearch(query, start) {
  const res = await customSearch.cse.list({
    cx: engineId,
    auth: apiKey,
    q: query,
    start: start,
    num: resultsPerPage,
  });

  return _formatSearchItems(res.data.items || []);
};

module.exports.googleSearchImage = async function googleSearchImage(
  query,
  start,
) {
  const res = await customSearch.cse.list({
    cx: engineId,
    auth: apiKey,
    q: query,
    start: start,
    num: resultsPerPage,
    searchType: 'image',
    fileType: 'jpeg',
  });

  return _formatImageSearchItems(res.data.items);
};

module.exports.resultsPerPage = resultsPerPage;

function _formatImageSearchItems(items) {
  return items.map((item, i) => {
    return {
      type: 'photo',
      id: i,
      photo_url: item.link,
      photo_width: item.image.width,
      photo_height: item.image.height,
      title: item.title || '',
      description: item.snippet || '',
      thumb_url: item.image.thumbnailLink || undefined,
    };
  });
}

function _formatSearchItems(items) {
  const inlineQueryAnswer = items.map((item, i) => {
    const thumb = _resolveThumb(item);
    return {
      type: 'article',
      id: i,
      title: item.title || '',
      url: item.link || '',
      description: item.snippet || '',
      thumb_url: thumb.url || undefined,
      thumb_width: thumb.width || undefined,
      thumb_height: thumb.height || undefined,
      input_message_content: {
        message_text:
          '<b>' +
          htmlEntities.encode(item.title || '', {
            useNamedReferences: false,
          }) +
          '</b>\n' +
          htmlEntities.encode(item.link || '', {
            useNamedReferences: false,
          }),
        parse_mode: 'HTML',
      },
    };
  });

  return inlineQueryAnswer;
}

function _resolveThumb(item) {
  if (
    item.pagemap &&
    item.pagemap.cse_thumbnail &&
    item.pagemap.cse_thumbnail[0] &&
    item.pagemap.cse_thumbnail[0].src &&
    item.pagemap.cse_thumbnail[0].src.match &&
    item.pagemap.cse_thumbnail[0].src.match(/^(https?:\/\/).+/)
  ) {
    return {
      url: item.pagemap.cse_thumbnail[0].src,
      width: item.pagemap.cse_thumbnail[0].width || null,
      height: item.pagemap.cse_thumbnail[0].height || null,
    };
  }

  if (
    item.pagemap &&
    item.pagemap.cse_image &&
    item.pagemap.cse_image[0] &&
    item.pagemap.cse_image[0].src &&
    item.pagemap.cse_image[0].src.match &&
    item.pagemap.cse_image[0].src.match(/^(https?:\/\/).+/)
  ) {
    return {
      url: item.pagemap.cse_image[0].src,
      width: item.pagemap.cse_image[0].width || null,
      height: item.pagemap.cse_image[0].height || null,
    };
  }

  return {
    url: null,
    width: null,
    height: null,
  };
}
