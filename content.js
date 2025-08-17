async function generateComment(commentBox) {
  const postText = getPostTextFromBox(commentBox);

  if (!postText) {
    console.warn("No post text found for this comment box.");
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post: postText })
    });

    if (!response.ok) {
      console.error("Backend error:", await response.text());
      return;
    }

    const data = await response.json();
    commentBox.innerText = data.comment; // Fill the LinkedIn comment box
  } catch (err) {
    console.error("Error calling backend:", err);
  }
}

function getPostTextFromBox(commentBox) {
  // Try finding a standard post container first
  let postContainer = commentBox.closest('article');

  // Fallback for "comments" activity page
  if (!postContainer) {
    postContainer = commentBox.closest('.feed-shared-update-v2') ||
                    commentBox.closest('.comments-comment-item') ||
                    commentBox.closest('[data-id]');
  }

  if (!postContainer) {
    console.warn("No parent article or post container found for comment box.");
    return '';
  }

  // Multiple selectors for LinkedIn text
  const possibleSelectors = [
    '.update-components-text', // main feed posts
    '.feed-shared-update-v2__description', // old layout
    '.comments-comment-item__main-content', // comment text
    'span.break-words',
    'div[dir="ltr"]',
    'p' // generic paragraphs (sometimes used in comments view)
  ];

  for (const selector of possibleSelectors) {
    const el = postContainer.querySelector(selector);
    if (el && el.innerText.trim().length > 0) {
      return el.innerText.trim();
    }
  }

  return '';
}


// Watch the DOM for new comment boxes and add our button
const observer = new MutationObserver(() => {
  const commentBoxes = document.querySelectorAll('div[role="textbox"]');

  commentBoxes.forEach(box => {
    if (!box.parentElement.querySelector('.ai-comment-btn')) {
      const btn = document.createElement('button');
      btn.innerText = '✨ AI Comment';
      btn.className = 'ai-comment-btn';
      btn.style.marginLeft = '8px';
      btn.style.cursor = 'pointer';
      btn.onclick = () => generateComment(box);
      box.parentElement.appendChild(btn);
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
