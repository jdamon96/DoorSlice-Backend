# DoorSlice-Backend
Coded June/July 2016.

DoorSlice was a collaborative project with https://github.com/Anteloper that allowed users to order pizza with a single tap. The front end iOS source code is available at https://github.com/Anteloper/DoorSlice. 

The backend is a RESTful API implemented in nodejs using express. The application uses four models/controllers: users, orders, cards (user's credit card information), and addresses. API responses are JSON.

## Endpoints

**User**:

| URL           | HTTP Request  | Description  | 
| ------------- |:-------------:| ------------:|
| /users        | POST          | creates a new user|
| /users/login      | POST      |   Creates JWT for user and sends as response |
| /users/addEmail/:user_id | POST      |    adds email to user's profile|
| /users/wantsReceipts/:user_id | POST      |    toggles user's receipt preference|
| /users/wantsConfirmation/:user_id | POST      |    toggles user's order confirmation preference|
| /users/hasSeenTutorial/:user_id | POST    |  marks if user has seen app tutorial|
| /users/:user_id | GET      |    returns user's profile        |

**Order**:

| URL           | HTTP Request  | Description  | Request Requirements  | 
| ------------- |:-------------:|:------------:| ------------:|
| /orders/:user_id/:address_id        | POST | creates new order |cheese, pepperoni, price, cardUsed|
| /rateOrder/:user_id      | POST      |creates new order review|   stars, review |


**Card ("payment")**:

| URL           | HTTP Request  | Description  | Request Requirements  | 
| ------------- |:-------------:|:------------:| ------------:|
| /payments/newStripeUser/:user_id/       | POST | creates a new Stripe profile for indicated user |stripeToken, lastFour|
| /payments/newStripeCard/:user_id      | POST      |adds new credit card to user's Stripe profile|  stripeToken, lastFour |
| /payments/updateDefaultCard/:user_id/       | POST | updates user's default Stripe credit card|cardID|
| /payments/removeCard/:user_id/       | POST | removes credit card from user's Stripe profile |cardID|
| /payments/charge/:user_id/       | POST | charges user's Stripe profile |chargeAmount, chargeDescription, stripeToken|


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

