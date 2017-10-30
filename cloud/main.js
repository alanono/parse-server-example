var fs = require('fs');
//var CityLocation = require('./js_lib/citylocation.js');

Parse.Cloud.define('syncCity', function(request, response) {
  try{
	  //queryMuncipios(request);
	  response.success("OK");	  
  } catch(err){
	response.error(err);
  } 
});

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});


//http://stackoverflow.com/questions/32914945/how-to-query-objects-in-the-cloudcode-beforesave
Parse.Cloud.beforeSave("Apiario", function(request, response) {
  var log = request.log;
  var apiario = request.object;
  var storeJSON = apiario.toJSON();
  log.info("apiario ID " + apiario.id + "qtdCaixas" + apiario.get("qtdCaixas"));
  
  if(apiario.id){
	  var ApiarioClass = Parse.Object.extend("Apiario");
	  var apiarioOld = new ApiarioClass();
	  
	  apiarioOld.set("objectId", apiario.id);
	  apiarioOld.fetch({
		success: function(apiarioOld) {
			log.info("apiario ID " + apiario.id + "qtdCaixasApiario" + apiario.get("qtdCaixas"));
			var historicoApiario = new Parse.Object("HistoricoApiario");

			historicoApiario.set("apiario", apiarioOld);
			historicoApiario.set("location", apiarioOld.get("location"));
			historicoApiario.set("migratorio", apiarioOld.get("migratorio"));
			historicoApiario.set("qtdCaixas", apiarioOld.get("qtdCaixas"));
			console.log(apiarioOld.get("qtdCaixas")+"qtdCaixasOld");
			historicoApiario.set("dialogoVizinhos", apiarioOld.get("dialogoVizinhos"));
			historicoApiario.set("distanciaDeslocamentoCaixas", apiarioOld.get("distanciaDeslocamentoCaixas"));
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
			historicoApiario.set("associacao", apiarioOld.get("associacao"));
			historicoApiario.set("excluded", apiarioOld.get("excluded"));
			historicoApiario.set("modificadoPor", request.user);

			historicoApiario.save();

			log.debug(storeJSON+" ");
			// Recreating Apiario
            for ( key in storeJSON ) {
                apiario.set( key, storeJSON[key]);
            }			
			
			log.info("apiario ID " + apiario.id + "qtdCaixasApiario" + apiario.get("qtdCaixas"));
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
  query.limit(6000).skip(0).find().then(function(results){
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
        if(request.params.nomeGestor)
			object.set("nomeGestor", request.params.nomeGestor);
			  if(request.params.excluded)
			object.set("excluded", request.params.excluded);
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
   
   if(request.params.noInclude)
	query.include("apicultor").include("associacao"); 

   if(request.params.limit)
	 query.limit(parseInt(request.params.limit));
   else
	 query.limit(1000);

   if(request.params.skip)
	  query.skip(request.params.skip);
   
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
	//queryApiarios.equalTo('valido', true).equalTo('ativo', true).notEqualTo('excluded', true);
	queryApiarios.include("apicultor").include("associacao").limit(1000);
	queryApiarios.find().then(function(results){
		log.info("qtd apiarios: " + results.length);
		for (var i = 0; i < results.length; ++i) {
			if(!results[i].get("apicultor") || !results[i].get("associacao"))
				continue;
			var apicAssoc;
			var key = results[i].get("apicultor").id + '-' + results[i].get("associacao").id;
			log.info("key:"+key);
			if(map[key]){
				apicAssoc = map[key];
			} else {
				apicAssoc = new ApicultorAssociacao();
				apicAssoc.set("apicultor", results[i].get("apicultor"));
				apicAssoc.set("associacao", results[i].get("associacao"));
				map[key] = apicAssoc;
			}
			apicAssoc.increment("qtdCaixas", results[i].get("qtdCaixas") || 0);
			apicAssoc.increment("qtdPontos");
		}
		log.info("antes do saveAll");
		return Parse.Object.saveAll(Object.values(map), {
			success: function(list) {
				response.success("Sucesso");
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


Parse.Cloud.beforeSave("Associacao", function(request, response) {
  var log = request.log;
  var associacao = request.object;
  var storeJSON = associacao.toJSON();
  log.info("associacao ID " + associacao.id);
  
  if(associacao.id){
	  var AssociacaoClass = Parse.Object.extend("Associacao");
	  var associacaoOld = new AssociacaoClass();
	  
	  associacaoOld.set("objectId", associacao.id);
	  associacaoOld.fetch({
		success: function(associacaoOld) {
			log.info("associacao ID " + associacao.id);
			var historicoAssociacao = new Parse.Object("HistoricoAssociacao");

			historicoAssociacao.set("associacao", associacaoOld);
			historicoAssociacao.set("bairro", associacaoOld.get("bairro"));
			historicoAssociacao.set("sigla", associacaoOld.get("sigla"));
			historicoAssociacao.set("tipoRegistro", associacaoOld.get("tipoRegistro"));
			historicoAssociacao.set("nome", associacaoOld.get("nome"));
			historicoAssociacao.set("numeroSif", associacaoOld.get("numeroSif"));
			historicoAssociacao.set("registro", associacaoOld.get("registro"));
			historicoAssociacao.set("endereco", associacaoOld.get("endereco"));
			historicoAssociacao.set("telefone", associacaoOld.get("telefone"));
			historicoAssociacao.set("contatoPresidenteNome", associacaoOld.get("contatoPresidenteNome"));
			historicoAssociacao.set("contatoPresidenteTelefone", associacaoOld.get("contatoPresidenteTelefone"));
			historicoAssociacao.set("uuid", associacaoOld.get("uuid"));
			historicoAssociacao.set("municipio", associacaoOld.get("municipio"));
			historicoAssociacao.set("email", associacaoOld.get("email"));
			historicoAssociacao.set("cep", associacaoOld.get("cep"));
			historicoAssociacao.set("excluded", associacaoOld.get("excluded"));
			historicoAssociacao.set("modificadoPor", request.user);

			historicoAssociacao.save();

			log.debug(storeJSON+" ");
			// Recreating Associacao
            for ( key in storeJSON ) {
                associacao.set( key, storeJSON[key]);
            }			
			
			log.info("associacao ID " + associacao.id);
			response.success();
		},
		error: function(associacaoOld, error) {
		  response.error("Got an error " + error.code + " : " + error.message);
		}
	  });
  }
  else{
	  console.log("Nova associacao");
	  response.success();
  }
});  


Parse.Cloud.beforeSave("Propriedade", function(request, response) {
  var log = request.log;
  var propriedade = request.object;
  var storeJSON = propriedade.toJSON();
  log.info("propriedade ID " + propriedade.id);
  
  if(propriedade.id){
	  var PropriedadeClass = Parse.Object.extend("Propriedade");
	  var propriedadeOld = new PropriedadeClass();
	  
	  propriedadeOld.set("objectId", propriedade.id);
	  propriedadeOld.fetch({
		success: function(propriedadeOld) {
			log.info("propriedade ID " + propriedade.id);
			var historicoPropriedade = new Parse.Object("HistoricoPropriedade");

			historicoPropriedade.set("propriedade", propriedadeOld);
			historicoPropriedade.set("nome", propriedadeOld.get("nome"));
			historicoPropriedade.set("rotaAcesso", propriedadeOld.get("rotaAcesso"));
			historicoPropriedade.set("municipio", propriedadeOld.get("municipio"));
			historicoPropriedade.set("uuid", propriedadeOld.get("uuid"));
			historicoPropriedade.set("excluded", propriedadeOld.get("excluded"));
			historicoPropriedade.set("apicultores", propriedadeOld.get("apicultores"));
			historicoPropriedade.set("modificadoPor", request.user);
			
			historicoPropriedade.save();

			log.debug(storeJSON+" ");
            for ( key in storeJSON ) {
                propriedade.set( key, storeJSON[key]);
            }			
			
			log.info("propriedade ID " + propriedade.id);
			response.success();
		},
		error: function(propriedadeOld, error) {
		  response.error("Got an error " + error.code + " : " + error.message);
		}
	  });
  }
  else{
	  console.log("Nova propriedade");
	  response.success();
  }
});  


Parse.Cloud.beforeSave("Apicultor", function(request, response) {
  var log = request.log;
  var apicultor = request.object;
  var storeJSON = apicultor.toJSON();
  log.info("apicultor ID " + apicultor.id);
  
  if(apicultor.id){
	  var ApicultorClass = Parse.Object.extend("Apicultor");
	  var apicultorOld = new ApicultorClass();
	  
	  apicultorOld.set("objectId", apicultor.id);
	  apicultorOld.fetch({
		success: function(apicultorOld) {
			log.info("apicultor ID " + apicultor.id);
			var historicoApicultor = new Parse.Object("HistoricoApicultor");

			historicoApicultor.set("apicultor", apicultorOld);
			historicoApicultor.set("nome", apicultorOld.get("nome"));
			historicoApicultor.set("endereco", apicultorOld.get("endereco"));
			historicoApicultor.set("telefone", apicultorOld.get("telefone"));
			historicoApicultor.set("celular", apicultorOld.get("celular"));
			historicoApicultor.set("email", apicultorOld.get("email"));
			historicoApicultor.set("registroSif", apicultorOld.get("registroSif"));
			historicoApicultor.set("uuid", apicultorOld.get("uuid"));
			historicoApicultor.set("cpf", apicultorOld.get("cpf"));
			historicoApicultor.set("municipio", apicultorOld.get("municipio"));
			historicoApicultor.set("apicultorAssociacao", apicultorOld.get("apicultorAssociacao"));
			historicoApicultor.set("excluded", apicultorOld.get("excluded"));
			historicoApicultor.set("modificadoPor", request.user);
			
			historicoApicultor.save();

			log.debug(storeJSON+" ");
            for ( key in storeJSON ) {
                apicultor.set( key, storeJSON[key]);
            }			
			
			log.info("apicultor ID " + apicultor.id);
			response.success();
		},
		error: function(apicultorOld, error) {
		  response.error("Got an error " + error.code + " : " + error.message);
		}
	  });
  }
  else{
	  console.log("Novo apicultor");
	  response.success();
  }
});  


Parse.Cloud.beforeSave("ApicultorAssociacao", function(request, response) {
  var log = request.log;
  var apicultorAssociacao = request.object;
  var storeJSON = apicultorAssociacao.toJSON();
  log.info("apicultorAssociacao ID " + apicultorAssociacao.id);
  
  if(apicultorAssociacao.id){
	  var ApicultorClass = Parse.Object.extend("ApicultorAssociacao");
	  var apicultorAssociacaoOld = new ApicultorClass();
	  
	  apicultorAssociacaoOld.set("objectId", apicultorAssociacao.id);
	  apicultorAssociacaoOld.fetch({
		success: function(apicultorAssociacaoOld) {
			log.info("apicultorAssociacao ID " + apicultorAssociacao.id);
			var historicoApicultorAssociacao = new Parse.Object("HistoricoApicultorAssociacao");

			historicoApicultorAssociacao.set("apicultorAssociacao", apicultorAssociacaoOld);
			historicoApicultorAssociacao.set("uuid", apicultorAssociacaoOld.get("uuid"));
			historicoApicultorAssociacao.set("associacao", apicultorAssociacaoOld.get("associacao"));
			historicoApicultorAssociacao.set("qtdPontos", apicultorAssociacaoOld.get("qtdPontos"));
			historicoApicultorAssociacao.set("qtdCaixas", apicultorAssociacaoOld.get("qtdCaixas"));

			historicoApicultorAssociacao.save();

			log.debug(storeJSON+" ");
            for ( key in storeJSON ) {
                apicultorAssociacao.set( key, storeJSON[key]);
            }			
			
			log.info("apicultorAssociacao ID " + apicultorAssociacao.id);
			response.success();
		},
		error: function(apicultorAssociacaoOld, error) {
		  response.error("Got an error " + error.code + " : " + error.message);
		}
	  });
  }
  else{
	  console.log("Novo apicultorAssociacao");
	  response.success();
  }
});  
