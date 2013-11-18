define([
  'underscore', 
  'backbone', 
  'shared',
  'models/home/ServerModel',
  'expressoAPI',
  ], function(_, Backbone,Shared, ServerModel,expressoAPI){
	  
  var ServersCollection = Backbone.Collection.extend({

    model: ServerModel,

    _data: {},

    done: function (value) {
        this._data.done = value;
        return this;
    },

    fail: function (value) {
        this._data.fail = value;
        return this;
    },

    initialize : function(models, options) {
        this.api = Shared.api;
        this.model = ServerModel;
    },

    getServers : function() {

      var that = this;

      var data = this._data;

	    var jqxhr = $.ajax("servers.json").done(function(tempData) {
        try {

          var result = jQuery.parseJSON(tempData).result;

          for (var i in result.servers) {
            console.log(result.servers[i]);
            var currentModel = new ServerModel(result.servers[i]);
            that.add(currentModel);
          }

          if (that._data.done) { 
            that._data.done(that); 
          }

        } catch(error) {

          //NAO CONSEGUIU FAZER O PARSER DO JSON LOCAL PORQUE RETORNOU UM HTML (DEVIDO AO HTACCESS).
          //NAO ACHOU O ARQUIVO SERVERS.JSON LOCALMENTE E ESTÁ TENTANDO BUSCAR A LISTA DE SERVIDORES NA URL DO EXPRESSOLIVRE.

          var serverURL = "http://expressolivre.org/api/rest/";

          var isPhoneGap = Shared.api.phoneGap();

          if (isPhoneGap) {
            Shared.api.context(serverURL).crossdomain(serverURL);
          } else {
            Shared.api.context(Shared.context).crossdomain(serverURL);
          }

          Shared.api
          .resource('AvailableServers')
          .params({})
          .done(function(result){

            for (var i in result.servers) {
              var currentModel = new ServerModel(result.servers[i]);
              that.add(currentModel);
            }

            if (that._data.done) { 
              that._data.done(that); 
            }

            return false;
          })
          .fail(function(error){

            if (that._data.fail) { 
              that._data.fail(error); 
            }

            return false;
          })
          .execute();

        }
  		});

      return that;
    },

  });
  return ServersCollection;
});
