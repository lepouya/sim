const game = {
  name: 'World Domination Simulator',
  version: '0.0.1',
  updateGranularity: 0.25,
  maxUpdateCycles: 3600,
  tutorial: {
    steps: [
      {
        text: "Welcome to the world domination simulator!<br/>" +
              "You are a poor nobody in middle of a poor village, but you have some ideas about world domination and a ridiculous amount of determination<br/>" +
              "<br/>Oh, and some magic.<br/><br/>...<br/>Definitely a lot of magic!<br/>Through this console, that is.<br/></br>" +
              "Let's get started and dominate this digital world of yours!" +
              "<p>Author's note: I'm still in very experimental phase, so you might have to reset your game often</p>",
        button: "Let's get started",
      },
      {
        text: "First, let's get familiarized with some basic resources<br/>" +
              'On the "Resources" tab below, go to the "Wood" section and try to chop some wood<br/>' +
              "5 pieces sould be enough",
        post: {wood: 5},
        button: "All done!",
      },
      {
        text: "Great!<br/>" +
              "You might have noticed that you can't have more than 10 pieces of wood at once. " +
              "We will talk about how you can increase the size of the storage later",
        button: "Ok, so what can I do with these now?",
      },
      {
        text: "Next, let's talk about money<br/>" +
              "You will need some coins if you want to dominate this world... ok, a lot of coins<br/><br/>" +
              "Go ahead and sell some of that wood you just axed down. You can get 1 coin for each one of them from the local market",
        post: {coin: 1},
        prize: {coin: 5},
        button: "Yay I got some money",
      },
      {
        text: 'Notice that a new "Money" section just opened up below. Go ahead and look in it<br/>' +
              "We're gonna need some more coins if we want to continue. How about you sell the rest of that wood?",
        post: {coin: 10},
        button: "I'm rich!",
      },
      {
        text: "Now let's get quarrying! Put your back to it and go to the Stone section below and dig out some rocks!<br/>" +
              "5 pieces should be enough",
        post: {stone: 5},
        prize: {wood: 5},
        button: "Easy peasy",
      },
      {
        text: "Great!<br/>" +
              "Now, why don't we try and make some storage places so that we can keep more of the goodies and resources?<br/>" +
              "Go ahead and chop down some more wood. We're gonna need some wood and stone to build a makeshift shed",
        post: {coin: 10, wood: 10, stone: 5},
        prize: {coin: 10},
        button: "Phew! That was hard work",
      },
      {
        text: "You can build a wood shed now!<br/>" +
              "To build a shed, you'll need to lay a bed of rocks, then put some logs on top of it. " +
              "Also buy some supplies from the market to put the whole thing together<br/>" +
              "Go ahead and build one now",
        post: {'wood shed': 1},
        prize: {coin: 10, wood: 5, stone: 5},
        button: "I have built my masterpiece!",
      },
      {
        text: "Nice! The storage limit for your wood doubled now!<br/>" +
              "With every new shed you make, you get better at it and can build a bigger and better one that stores " + 
              "twice as much as before! But it will also cost more to build. You know, because it's bigger and better<br/>" +
              "<br/>Now, go ahead and build a place to store more stone. You might need to first dig out 10 pieces of stone before the dump unlocks",
        post: {'stone dump': 1},
        prize: {coin: 10, wood: 5, stone: 5},
        button: "I have built another masterpiece!",
      },
      {
        text: "Nice! The storage limit for your stone doubled now!<br/>" +
              "Maybe we should get some villagers to just axe wood and dig rocks for us?<br/>" +
              "I mean, this is all about world domination after all!",
      },
      {
        text: "That's all the tutorial I have made so far. Next time you come back you might actually have to reset the game",
        button: "Finish tutorial",
      },
    ],
  },
  tabs: [{
      title: 'Resources',
      items: [{
          title: 'Money',
          primary: 'coin',
          items: [{primary: ['coin']}],
        },
        {
          title: 'Wood',
          primary: 'wood',
          items: [
            {items: ['wood', 'wood shed']},
          ],
        },
        {
          title: 'Stone',
          primary: 'stone',
          items: [
            {items: ['stone', 'stone dump']},
          ],
        },
      ]
    },
    {
      title: 'People',
      primary: 'invisible',
      items: [],
    },
  ],
  growths: {
    '*2': {
      growthFunction: 'multiplicative',
      coefficient: 2,
    },
    '-50%': {
      growthFunction: 'percentage',
      coefficient: -50,
    },
  },
  resources: {
    invisible: {visible: false},
    coin: {
      description: "The main currency of your world",
      count: 0,
      visible: false,
      requirement: [{entity: 'coin', baseRate: 1}],
    },
    wood: {
      description: "Basic material for construction",
      count: 0,
      limit: 10,
      unlocked: true,
      price: [{entity: 'coin', baseRate: 0}],
      sellModifier: [{growthFunction: 'constant', coefficient: 1}],
      display: {buy: 'Chop'},
    },
    stone: {
      description: "Basic material for construction",
      count: 0,
      limit: 10,
      visible: false,
      requirement: [{entity: 'coin', baseRate: 5}],
      price: [{entity: 'coin', baseRate: 0}],
      sellModifier: [{growthFunction: 'constant', coefficient: 1}],
      display: {buy: 'Dig'},
    },
    'wood shed': {
      description: "A place to store the pieces of wood you've chopped<br/>" +
                   "Increases the maximum limit of wood",
      visible: false,
      requirement: [{entity: 'wood', baseRate: 10}],
      price: [
        {entity: 'coin', baseRate: 10},
        {entity: 'wood', baseRate: 10},
        {entity: 'stone', baseRate: 5},
      ],
      purchaseGrowth: ['*2'],
      setsLimitFor: [{
        entity: 'wood',
        bonuses: [ // 10 * 2^n
          {growthFunction: 'exponential', coefficient: 2},
          {growthFunction: 'multiplicative', coefficient: 10},
        ]
      }],
      display: {buy: 'Build'},
    },
    'stone dump': {
      description: "A place to store all the stone you've dug<br/>" +
                   "Increases the maximum limit of stone",
      visible: false,
      requirement: [{entity: 'stone', baseRate: 10}],
      price: [
        {entity: 'coin', baseRate: 10},
        {entity: 'stone', baseRate: 10},
        {entity: 'wood', baseRate: 5},
      ],
      purchaseGrowth: ['*2'],
      setsLimitFor: [{
        entity: 'stone',
        bonuses: [ // 10 * 2^n
          {growthFunction: 'exponential', coefficient: 2},
          {growthFunction: 'multiplicative', coefficient: 10},
        ]
      }],
      display: {buy: 'Build'},
    },
  },
};

export default game;