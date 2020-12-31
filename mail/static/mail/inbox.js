document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('form').onsubmit = send_email;
  

  // By default, load the inbox
  load_mailbox('inbox');

  
  function send_email() {
    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;
    
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })

    .then(response => response.json())
    .then(result => {
      console.log(result)
    })

    load_mailbox('sent');
    
    return false
  }


  
// END OF DOM LOADED CONTENT
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
    
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-details').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 id="mailbox">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load e-mails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)
    // Display e-mails
    emails.forEach(element => email_card(element));
  });   
}

function email_card(element) {
  // CREATE DIV FOR EACH EMAIL AND MAKE IT GRAY IF READ (ONLY ON INBOX)
  emailDiv = document.createElement('div');
  emailDiv.classList.add('container');
  emailDiv.classList.add('row');
  emailDiv.classList.add('emailDiv');
  emailDiv.id = `emailID${element.id}`;
  document.querySelector('#emails-view').append(emailDiv);
  if (element.read === false && document.getElementById('mailbox').innerHTML === "Inbox") {
    emailDiv.style.fontWeight = "bold";
  };
  if (element.read === true && document.getElementById('mailbox').innerHTML === "Inbox") {
    emailDiv.style.backgroundColor = "LightGrey";
  };

  // CREATE AND APPEND SENDER DIV
  senderDiv = document.createElement('div');
  senderDiv.classList.add('col-4');
  senderDiv.classList.add('senderDiv');
  senderDiv.innerHTML = element.sender;
  document.querySelector(`#emailID${element.id}`).append(senderDiv);

  // CREATE AND APPEND SUBJECT DIV  
  subjectDiv = document.createElement('div');
  subjectDiv.classList.add('col');
  subjectDiv.classList.add('subjectDiv');
  subjectDiv.innerHTML = element.subject;
  document.querySelector(`#emailID${element.id}`).append(subjectDiv);

  // CREATE AND APPEND TIMESTAMP DIV
  timestampDiv = senderDiv = document.createElement('div');
  timestampDiv.classList.add('col-3');
  timestampDiv.classList.add('timestampDiv');
  timestampDiv.innerHTML = element.timestamp;
  document.querySelector(`#emailID${element.id}`).append(timestampDiv);

  document.querySelector(`#emailID${element.id}`).addEventListener('click', () => emailDetails(`${element.id}`));
}

function emailDetails(id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'block';
  document.querySelector('#inbox-details').style.display = 'block';
  document.querySelector('#archived-details').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  if (document.getElementById('mailbox').innerHTML != "Inbox") {
    document.querySelector('#inbox-details').style.display = 'none';
  }

  if (document.getElementById('mailbox').innerHTML === "Inbox") {
    document.querySelector('#replyButton').onclick = () => reply(`${id}`);
    document.querySelector('#unreadButton').onclick = () => unread(`${id}`);
    document.querySelector(`#archiveButton`).onclick = () => archive(`${id}`);
  }

  if (document.getElementById('mailbox').innerHTML === "Archive") {
    document.querySelector('#archived-details').style.display = 'block';
    document.querySelector('#unarchiveButton').onclick = () => unarchive(`${id}`);
  }

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    document.querySelector('#emailSubject').innerHTML = `${email.subject}`;
    document.querySelector('#emailSender').innerHTML = `${email.sender}`;
    document.querySelector('#emailRecipients').innerHTML = `${email.recipients}`;
    document.querySelector('#emailTimestamp').innerHTML = `${email.timestamp}`;
    document.querySelector('#emailBody').innerHTML = `${email.body}`;
    
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    }) 
    
  });

}

function unread(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: false
    })
  })
  console.log(`${id} is the ID`)
  document.querySelector('#emails-view').innerHTML = '';

  load_mailbox('inbox');

}

function archive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  }) 
  console.log(`${id} is the ID`)
  document.querySelector('#emails-view').innerHTML = '';

  load_mailbox('inbox');
}

function unarchive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  }) 
  console.log(`${id} is the ID`)
  document.querySelector('#emails-view').innerHTML = '';

  load_mailbox('inbox');
}

function reply(id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print emails
    console.log(email);
      // Prefill composition fields
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      if (email.subject.includes('RE: ')) {
        document.querySelector('#compose-subject').value = `${email.subject}`;
      } else {
        document.querySelector('#compose-subject').value = `RE: ${email.subject}`;
      }
      document.querySelector('#compose-body').value = `
      On ${email.timestamp} ${email.sender} wrote:
${email.body}`.trim();
  });
}

  
