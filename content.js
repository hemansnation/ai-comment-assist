let generatedComment = '';
let originalPost = '';

async function generateComment(commentBox) {
  console.log("🎯 AI Comment button clicked!");
  
  const postText = getPostTextFromBox(commentBox);
  console.log("Post text extracted:", postText);

  if (!postText) {
    console.warn("No post text found for this comment box.");
    return;
  }

  try {
    console.log("Calling backend to generate comment...");
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
    console.log("Generated comment:", data.comment);
    
    // Store data in the comment box
    commentBox.dataset.generatedComment = data.comment;
    commentBox.dataset.originalPost = postText;
    
    console.log("Data stored in comment box:");
    console.log("- Generated:", commentBox.dataset.generatedComment);
    console.log("- Original post:", commentBox.dataset.originalPost);
    
    // Fill the LinkedIn comment box
    commentBox.innerText = data.comment;
    
    console.log("✅ AI comment generated and data stored");
  } catch (err) {
    console.error("Error calling backend:", err);
  }
}

async function storeComment(commentBox, finalComment) {
  const generatedComment = commentBox.dataset.generatedComment || '';
  const originalPost = commentBox.dataset.originalPost || '';
  
  if (!generatedComment || !originalPost) {
    console.warn("Missing generated comment or original post data");
    return;
  }

  // Extract author info from post
  const postAuthor = getPostAuthor(commentBox);
  
  try {
    const response = await fetch('http://127.0.0.1:5000/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_post: originalPost,
        generated_comment: generatedComment,
        final_comment: finalComment,
        post_author: postAuthor,
        your_relationship: 'connection' // You can enhance this
      })
    });

    if (response.ok) {
      console.log("Comment stored successfully for training");
    } else {
      console.error("Failed to store comment:", await response.text());
    }
  } catch (err) {
    console.error("Error storing comment:", err);
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

function getPostAuthor(commentBox) {
  const postContainer = commentBox.closest('article') || 
                       commentBox.closest('.feed-shared-update-v2') ||
                       commentBox.closest('.comments-comment-item');
  
  if (!postContainer) return '';
  
  // Look for author name in various LinkedIn layouts
  const authorSelectors = [
    'span[aria-hidden="false"] span[aria-hidden="false"]', // main feed
    '.update-components-actor__name',
    '.feed-shared-actor__name',
    '.comments-post-meta__actor'
  ];
  
  for (const selector of authorSelectors) {
    const authorEl = postContainer.querySelector(selector);
    if (authorEl && authorEl.innerText.trim()) {
      return authorEl.innerText.trim();
    }
  }
  
  return 'Unknown Author';
}






async function sendCommentToLinkedIn(commentBox) {
  console.log("🚀 Send button clicked!");
  
  const finalComment = commentBox.innerText.trim();
  console.log("Final comment:", finalComment);
  
  if (!finalComment) {
    console.warn("No comment to send");
    return;
  }

  console.log("Generated comment data:", commentBox.dataset.generatedComment);
  console.log("Original post data:", commentBox.dataset.originalPost);

  // Find LinkedIn's comment submit button
  const commentForm = commentBox.closest('form') || 
                     commentBox.closest('.comments-comment-box') ||
                     commentBox.closest('.comments-comment-texteditor');
  
  console.log("Comment form found:", commentForm);
  
  if (commentForm) {
    const linkedinSubmitBtn = commentForm.querySelector('button[data-control-name="comments.post_comment"]') ||
                             commentForm.querySelector('button[aria-label*="Comment"]') ||
                             commentForm.querySelector('button[aria-label*="comment"]') ||
                             commentForm.querySelector('button[type="submit"]') ||
                             commentForm.querySelector('button[class*="submit-button"]') ||
                             commentForm.querySelector('button[class*="comments-comment-box__submit"]');
    
    console.log("LinkedIn submit button found:", linkedinSubmitBtn);
    
    if (linkedinSubmitBtn) {
      // Store the comment data first
      if (commentBox.dataset.generatedComment) {
        console.log("Storing comment data...");
        try {
          await storeComment(commentBox, finalComment);
          console.log("✅ Comment stored successfully");
        } catch (error) {
          console.error("❌ Error storing comment:", error);
        }
      } else {
        console.warn("No generated comment data to store");
      }
      
      // Then click LinkedIn's submit button
      console.log("Clicking LinkedIn submit button...");
      linkedinSubmitBtn.click();
      console.log("✅ Comment posted to LinkedIn");
    } else {
      console.warn("❌ LinkedIn submit button not found");
      // Show all buttons in the form for debugging
      const allButtons = commentForm.querySelectorAll('button');
      console.log("All buttons in form:", allButtons);
    }
  } else {
    console.warn("❌ Comment form not found");
  }
}

// Watch the DOM for new comment boxes and posts
const observer = new MutationObserver(() => {
  // Add buttons to comment boxes
  const commentBoxes = document.querySelectorAll('div[role="textbox"]');
  commentBoxes.forEach(box => {
    if (!box.parentElement.querySelector('.ai-comment-btn')) {
      // Find the post container for this comment box
      const postContainer = box.closest('article') || 
                           box.closest('.feed-shared-update-v2') ||
                           box.closest('.comments-comment-item');
      
      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.marginLeft = '8px';
      buttonContainer.style.display = 'inline-flex';
      buttonContainer.style.gap = '4px';
      
      
      // AI Comment button (second)
      const aiBtn = document.createElement('button');
      aiBtn.innerText = '✨ AI Comment';
      aiBtn.className = 'ai-comment-btn';
      aiBtn.style.cursor = 'pointer';
      aiBtn.style.padding = '4px 8px';
      aiBtn.style.fontSize = '12px';
      aiBtn.style.border = '1px solid #0073b1';
      aiBtn.style.backgroundColor = '#0073b1';
      aiBtn.style.color = 'white';
      aiBtn.style.borderRadius = '4px';
      aiBtn.onclick = () => generateComment(box);
      
      // Send button (third)
      const sendBtn = document.createElement('button');
      sendBtn.innerText = '📤 Send';
      sendBtn.className = 'ai-send-btn';
      sendBtn.style.cursor = 'pointer';
      sendBtn.style.padding = '4px 8px';
      sendBtn.style.fontSize = '12px';
      sendBtn.style.border = '1px solid #28a745';
      sendBtn.style.backgroundColor = '#28a745';
      sendBtn.style.color = 'white';
      sendBtn.style.borderRadius = '4px';
      sendBtn.onclick = () => sendCommentToLinkedIn(box);
      
      // Add buttons in order: AI Comment, Send
      buttonContainer.appendChild(aiBtn);
      buttonContainer.appendChild(sendBtn);
      box.parentElement.appendChild(buttonContainer);
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
