# DoorSlice-Backend
Coded June/July 2016.

DoorSlice was a collaborative project with https://github.com/Anteloper that allowed users to order pizza with a single tap. The front end iOS source code is available at https://github.com/Anteloper/DoorSlice. 

The backend is a RESTful API implemented in nodejs using express. The application uses four models/controllers: users, orders, cards (user's credit card information), and addresses.

## Endpoints

**User**:

• /users

• /users/authenticate

• /users/login

• /users/addEmail/:user_id

• /users/wantsReceipts/:user_id

• /user/hasSeenTutorial/:user_id

• /users/:user_id 

**Order**:

**Card**:

**Address**:

• /address/:user_id
  • POST: add a new address to a user's profile
• /address/:user_id/:address_id
  • DELETE: delete address from a user's profile
  

**Misc**:
• /sendPassCode
• /resetPass
• /isOpen/:user_id
• /sendOpenText
• /rateOrder/:user_id
• /prices
  • GET: returns prices for cheese slice and pepperoni slice
