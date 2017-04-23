//var fs = require('fs');
//var CityLocation = require('./js_lib/citylocation.js');

Parse.Cloud.define('syncCity', function(req, res) {
  response.success("Hello world!");
});

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.beforeSave("Associacao", function(request, response) {
	
  if (request.object.get("numeroSif") != undefined && request.object.get("objectId") != undefined) {
	var numeroSif  =  request.object.get("numeroSif");
	var objectId = request.object.id;
	
	
	var Associacao = Parse.Object.extend("Associacao");
	var query = new Parse.Query(Associacao);
	query.get(objectId, {
	  success: function(associacao) {
		var numeroSifNovo = associacao.get('numeroSif')
		console.log('objectId = '+objectId);
		console.log('object = '+associacao);
		console.log('numero sif antigo = '+numeroSif);
		console.log('numero sif novo = '+numeroSifNovo);
		if(numeroSifNovo != numeroSif){
			request.object.set("tipoRegistro",1);
			request.object.set("registro",numeroSif);
		}
		response.success();
	  },
	  error: function(object, error) {
		response.error("Objeto nao encontrado");
	  }
	});
  } else {
	  response.success();
  }
});

//http://stackoverflow.com/questions/32914945/how-to-query-objects-in-the-cloudcode-beforesave
Parse.Cloud.beforeSave("Apiario", function(request, response) {
  var apiario = request.object;
  var storeJSON = apiario.toJSON();
  console.log("apiario ID " + apiario.id + "qtdCaixas" + apiario.get("qtdCaixas"));
  
  if(apiario.id){
	  var ApiarioClass = Parse.Object.extend("Apiario");
	  var apiarioOld = new ApiarioClass();
	  
	  apiarioOld.set("objectId", apiario.id);
	  apiarioOld.fetch({
		success: function(apiarioOld) {
			console.log("apiario ID " + apiario.id + "qtdCaixasApiario" + apiario.get("qtdCaixas"));
			var historicoApiario = new Parse.Object("HistoricoApiario");

			historicoApiario.set("apiario", apiarioOld);
			historicoApiario.set("location", apiarioOld.get("location"));
			historicoApiario.set("migratorio", apiarioOld.get("migratorio"));
			historicoApiario.set("qtdCaixas", apiarioOld.get("qtdCaixas"));
			console.log(apiarioOld.get("qtdCaixas")+"qtdCaixasOld");
			historicoApiario.set("dialogoVizinhos", apiarioOld.get("dialogoVizinhos"));
			historicoApiario.set("existenciaMortalidadeAbelha", apiarioOld.get("existenciaMortalidadeAbelha"));
			historicoApiario.set("exameColmeiaDoenca", apiarioOld.get("exameColmeiaDoenca"));
			historicoApiario.set("historicoMortandade", apiarioOld.get("historicoMortandade"));
			historicoApiario.set("observacao", apiarioOld.get("observacao"));
			historicoApiario.set("apicultor", apiarioOld.get("apicultor"));
			historicoApiario.set("propriedade", apiarioOld.get("propriedade"));
			historicoApiario.set("especieAbelha", apiarioOld.get("especieAbelha"));
			historicoApiario.set("motivoMortandade", apiarioOld.get("motivoMortandade"));
			historicoApiario.set("motivoHistoricoMortandade", apiarioOld.get("motivoHistoricoMortandade"));
			historicoApiario.set("atividadeApicula", apiarioOld.get("atividadeApicula"));
			historicoApiario.set("culturas", apiarioOld.get("culturas"));
			historicoApiario.set("producoes", apiarioOld.get("producoes"));
			historicoApiario.set("elevacao", apiarioOld.get("elevacao"));
			historicoApiario.set("caminhoImagem", apiarioOld.get("caminhoImagem"));
			historicoApiario.set("ativo", apiarioOld.get("ativo"));
			historicoApiario.set("nomesArquivos", apiarioOld.get("nomesArquivos"));
			historicoApiario.set("uuid", apiarioOld.get("uuid"));

			historicoApiario.save();

			console.log(storeJSON+" ");
			// Recreating Apiario
            for ( key in storeJSON ) {
                apiario.set( key, storeJSON[key]);
            }			
			
			console.log("apiario ID " + apiario.id + "qtdCaixasApiario" + apiario.get("qtdCaixas"));
			response.success();
		},
		error: function(apiarioOld, error) {
		  response.error("Got an error " + error.code + " : " + error.message);
		}
	  });
  }
  else{
	  console.log("Novo apiario");
	  response.success();
  }
});  





function queryMuncipios(res){
  var ParseMunicipio_Object = Parse.Object.extend("Municipio");
  var query = new Parse.Query(ParseMunicipio_Object);
  query.limit(1000).skip(0).find().then(function(results){
      municipios = results;
      searchApiarios(res);
  });
}

function searchApiarios(res){
  var ParseApario_Object = Parse.Object.extend("Apiario");
  var queryObjectApiario = new Parse.Query(ParseApario_Object);

 queryObjectApiario.equalTo("municipio", null);
 queryObjectApiario.limit(1000).skip(0).include("municipio").find().then(function(results){
	  
    var apiariosToSave = [];
	  for(var index in results){
		  var apiario = results[index];
		  //var propriedade = apiario.get("propriedade");
      //var municipio = propriedade.get("municipio");


      //apiario.set("municipio",null);

      //apiario.get("municipio").get("nome");

		  apiariosToSave.push(apiario);
	  }

    //updateApiario(apiariosToSave,0);
    fixCities(apiariosToSave,0,res);

    function updateApiario(apiarios,i){
        if(i<apiarios.length){
		  
          var apiario = apiarios[i];
		  console.log(apiario.id);
          apiario.save(null, {
            success: function(apiarioSave) {
                i++;
                updateApiario(apiarios,i);    
            }
          });
        }else{
			res.success(apiarios.length+' municipios atualizados');
          return;
        }
    }

    function fixCities(apiarios,i,res){
       if(i<apiarios.length){
          var apiario = apiarios[i];
		  var location = {latitude:apiario.get("location").latitude,longitude:apiario.get("location").longitude};
		  
		  CityLocation.search(location,function(cityProperties){
            console.log(cityProperties.CD_GEOCMU);
            var municipioParse = searchCityByCodigo(cityProperties.CD_GEOCMU);
            apiario.set("municipio",municipioParse);
            i++;
            fixCities(apiarios,i,res);
          });
        }else{
          updateApiario(apiariosToSave,0,res);
          return;
        }
    }

	  
  },function(err){
	 console.error(err);
  });


}

function searchCityByCodigo(codigo){
  for(var index in municipios){
    var municipio = municipios[index];
    if(municipio.get("codigo")==codigo){
      return municipio;
    }
  }
  return null;
}

/*Foi alterada para updateUser, sera mantida temporariamente por motivos de compatibilidade*/
Parse.Cloud.define("updateUserPass", function(request, response) {
   var Query = Parse.Object.extend("_User");
   var query = new Parse.Query(Query);   
   query.equalTo("objectId", request.params.objectId);
   query.first({ useMasterKey: true }).then(function(object) {
        console.log(object);
		object.set("username", request.params.username);
        if(request.params.password)
			object.set("password", request.params.password);
		object.save(null,{
          useMasterKey: true,
          success: function(note){
            //u should wait the non-blocking call success and finish
            console.log("usuario atualizado ", object);
            response.success('Cloud Code: Usuario atualizado');
          }, error: response.error
        });
		
		response.success(object);
      }, function(error) {
        response.error(error);
      });
});

Parse.Cloud.define("updateUser", function(request, response) {
   var Query = Parse.Object.extend("_User");
   var query = new Parse.Query(Query);   
   query.equalTo("objectId", request.params.objectId);
   query.first({ useMasterKey: true }).then(function(object) {
        console.log(object);
        if(request.params.username)
			object.set("username", request.params.username);
        if(request.params.password)
			object.set("password", request.params.password);
        if(request.params.email)
			object.set("email", request.params.email);
        if(request.params.tipo)
			object.set("tipo", request.params.tipo);
		object.save(null,{
          useMasterKey: true,
          success: function(note){
            //u should wait the non-blocking call success and finish
            console.log("usuario atualizado ", object);
            response.success('Cloud Code: Usuario atualizado');
          }, error: response.error
        });
		
		response.success(object);
      }, function(error) {
        response.error(error);
      });
});

Parse.Cloud.define("listUsers", function(request, response) {
   var Query = Parse.Object.extend("_User");
   var query = new Parse.Query(Query);
   query.include("apicultor").include("associacao");   
   query.find({ useMasterKey: true }).then(function(objects) {
        console.log(objects);
		response.success(objects);
      }, function(error) {
        response.error(error);
      });
});

Parse.Cloud.define("notificaUsuario", function(request, response) {
	var log = request.log;
	var User = Parse.Object.extend("_User");
	var Session = Parse.Object.extend("_Session");
	var queryUser = new Parse.Query(User);
	queryUser.equalTo('objectId', request.params.objectId);
	var querySession = new Parse.Query(Session);
	querySession.matchesQuery('user', queryUser);
	querySession.find({ useMasterKey: true }).then(function(objects){
		log.info("installations: " + objects.length);
		var listIns = [];
		for (var i = 0; i < objects.length; ++i) {
			listIns.push(objects[i].get("installationId"));
		}
		var pushQuery = new Parse.Query(Parse.Installation);
		pushQuery.containedIn('installationId', listIns);
		// Send push notification to query
		Parse.Push.send({
		  where: pushQuery,
		  data: {
			alert: request.params.msg
		  }
		}, {
			useMasterKey: true,
		  success: function() {
			response.success('Enviados: ' + objects.length);
		  },
		  error: function(error) {
			// Handle error
			response.error(error);
		  }
		});
	}, function(err){
		console.log(err);
	});
});



Parse.Cloud.define("atualizaCaixasPontos", function(request, response) {
  var log = request.log;
  log.info("inicio atualizaCaixasPontos");
  var Apiario = Parse.Object.extend("Apiario");
  var ApicultorAssociacao = Parse.Object.extend("ApicultorAssociacao");
  var queryDelete = new Parse.Query(ApicultorAssociacao);
  var map = {};
  queryDelete.find().then(function(objects){
	  log.info("retorno consulta atualizaCaixasPontos");
	  //deleta os dados para recrialos
	  return Parse.Object.destroyAll(objects);
  }, function(err){
	  response.error(err);
  }).then(function(s){
	log.info("depois que deletou");
	var queryApiarios = new Parse.Query(Apiario);
	queryApiarios.find().then(function(results){
		log.info("atualizaCaixasPontos " + results.length);
		for (var i = 0; i < results.length; ++i) {
			var apicAssoc;
			var key = results[i].get("apicultor").get("objectId") + '-' + results[i].get("associacao").get("objectId");
			if(map[key]){
				apicAssoc = map[key];
			} else {
				apicAssoc = new ApicultorAssociacao();
				apicAssoc.set("apicultor", results[i].get("apicultor"));
				apicAssoc.set("associacao", results[i].get("associacao"));
				map[key] = apicAssoc;
			}
			apicAssoc.increment("qtdCaixas", results[i].get("qtdCaixas"));
			apicAssoc.increment("qtdPontos");
		}
		log.info("hmmaa");
		return Parse.Object.saveAll(Object.values(map), {
			success: function(list) {
				response.success("aee");
			},
			error: function(error) {
			  response.error(error);
			}
		});
		
	}, function(err){
		console.log(err);
		response.error(error);
	});
  });

});  
