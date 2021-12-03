# DoonWarCG
------------------------------------------

[Application Demo](https://troveofgems.github.io/DoonWarCG/)

# Purpose
A game made for twitter friends.

Future implementations will see this project hosted live and allow people to play each-other.

Project Currently Showcases:
- JS DOM Manipulation 
- Object-Oriented Programming

# Game Logic

Game Logic
- Details
  - Standard 52 Card Deck 
  - Deck is shuffled randomly between 3-8 times prior to start. Then randomly divved to a user. 
  - Winning hands may either be cashed out or sent to the pot for a possible compounded return value. 
  - Game ends when a player runs out of cards.

- Point System Tiers 
  - Tier 0 - Base Point Multiplier: 1x
  - Tier 1 - Base Point Multiplier: 1.25x 
  - Tier 2 - Base Point Multiplier: 1.75x 
  - Tier 3 - Base Point Multiplier: 3.5x

- Tier Thresholds 
  - Tier 0 - Pot sits at less than four (4) cards. 
  - Tier 1 - Pot sits at five to eleven (5-11) cards.
  - Tier 2 - Pot sits at twelve to fourteen (12 - 14) cards. 
  - Tier 3 - Pot sits at fifteen or more (15+) cards.

- CPU Cash-out Logic 
  - Tier 0 - CPU has a 1/8 or 13% chance To Cash In On The Pot 
  - Tier 1 - CPU has a 1/6 or 17% chance To Cash In On The Pot 
  - Tier 2 - CPU has a 1/4 or 25% chance To Cash In On The Pot 
  - Tier 3 - CPU has a 1/2 or 50% chance To Cash In On The Pot 
  - Survival Mode: When the CPU hand falls into the single digits, it will begin to play more aggressively by cashing out at every opportunity in the effort to prevent an endgame. This behavior resets once the CPU hand clears the single digit threshold.

---------------------------------------------------------------------

Final Notes:
This game was inspired by a conversation about boredom between twitter friends. All credit for photoshopping goes to Criticality (@fkthisall). Game Inspiration due to @Kinney0111
