App =
{
  web3Provider: null,
  contracts: {},
  account: '0x0',
  instance: null,

  init: function () 
  {
    return App.initWeb3();
  },

  initWeb3: function () 
  {
    if (typeof web3 !== 'undefined') 
    {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } 
    else 
    {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () 
  {
    $.getJSON("Queue.json", function (queue) 
    {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Queue = TruffleContract(queue);
      // Connect provider to interact with contract
      App.contracts.Queue.setProvider(App.web3Provider);

      return refresh();
    });
  },

  next: function () {
    App.instance.next(1).then(function()
    {
      App.render();
    });
  },

  render: function ()
  {
    $("#loader").show();
    $("#content").hide();
    
    web3.eth.getCoinbase(function (err, account) 
    {
      if (err === null) 
      {
        App.account = account;
        $("#accountAddress").html("Your Account: " + App.account);
      }
    });

    App.contracts.Queue.deployed()
    .then(function (_instance) 
    {
      App.instance = _instance;
      return _instance.getPosition();
    })
    .then(function (pos)
    {
      App.instance.getAll()
      .then(function (array) 
      {
        $("#currentStatus").html(array.length + " people are currently waiting");
        $("#content").show();
        $("#loader").hide();
      });
      
    });
  }
};

$(function () 
{
  $(window).load(function () 
  {
    App.init();
  });
});

function refresh() 
{
  setTimeout(refresh, 1000);
  App.render();
}