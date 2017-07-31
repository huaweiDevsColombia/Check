function getRouteHTMLFile(sheetname) {
        return new Promise( (resolve,reject) => {
            let url = "https://102z-ilike.teleows.com/servicecreator/pageservices/service.do?forAccessLog={serviceName:pdf_file_model_get,userId:" + MASTER_USER_ID + ",tenantId:" + tenantId + "}";
            $.ajax({
                type: "POST",
                url: url,
                data: {
                    "csrfToken": csrfToken,
                    "sheetname": sheetname,
                    "serviceId": "pdf_file_model_get"
                },
                success: (HTMLFileRouteResponse) => {
                    console.log("File Response : ", HTMLFileRouteResponse.result.file);
                    resolve(HTMLFileRouteResponse.result);
                },
                error: (jqXHR, exception) => {
                    console.error("An error ocurred on GETROUTEHTMLFILE Method");
                }
            });
        });
    }

    function getHTMLFile(batchID, attachmentID) {
        return new Promise( (resolve,reject) => {
            let url = "https://102z-ilike.teleows.com/app/fileservice/get";
            $.ajax({
                type: "POST",
                url: url,
                data: {
                    "csrfToken": csrfToken,
                    "batchId": batchID,
                    "attachmentId": attachmentID
                },
                success: (HTMLFileResponse) => {
					console.log("Success HTML");
                    resolve(HTMLFileResponse);
                },
                error: (jqXHR, exception) => {
                    console.error("An error ocurred on GETHTMLFILE Method " + exception);
                    reject("An error ocurred on GETHTMLFILE Method " + exception);
                }
            });
        });
    }

    function getDataInput(taskID) {
        return new Promise( (resolve,reject) => {
            let url = "https://102z-ilike.teleows.com/servicecreator/pageservices/service.do?forAccessLog={serviceName:getChecklistDataByTaskId,userId:" + MASTER_USER_ID + ",tenantId:" + tenantId + "}";
            $.ajax({
                type: "POST",
                url: url,
                data: {
                    "csrfToken": csrfToken,
                    "task_id": taskID,
                    serviceId: "getChecklistDataByTaskId"
                },
                success: (DataResponse) => {
					let dataFiltered = [];
                    console.log("Data Response ", DataResponse);
                    for (let key in DataResponse) {
                        for (let key in DataResponse) {
                        if (key.startsWith('S')) {
                            dataFiltered.push({key: DataResponse["" + key + ""]});    
                        }
                    }
                    resolve(dataFiltered);
                    }

                },
                error: function (jqXHR, exception) {
                    console.error("An error ocurred on GETDATAINPUT Method " + exception);
                    reject("An error ocurred on GETDATAINPUT Method " + exception);
                }
            });
        });
    }

    function getDataPhotos(taskID) {
        return new Promise( (resolve,reject) => {
            let url = "https://102z-ilike.teleows.com/servicecreator/pageservices/service.do?forAccessLog={serviceName:getChecklistPhotoByTaskId,userId:" + MASTER_USER_ID + ",tenantId:" + tenantId + "}";
            $.ajax({
                type: "POST",
                url: url,
                data: {
                    "csrfToken": csrfToken,
                    "task_id": taskID,
                    serviceId: "getChecklistPhotoByTaskId"
                },
                success: (DataResponse) => {
                    let dataFiltered= [];
                    for (let key in DataResponse) {
                        if (key.startsWith('S')) {
                            dataFiltered.push({ property:key ,  value: DataResponse["" + key + ""]});    
                        }
                    }
                    resolve(dataFiltered);
                
            },
                error: function (jqXHR, exception) {
                    console.error("An error ocurred on GETDATAINPUT Method " + exception);
                    reject("An error ocurred on GETDATAINPUT Method " + exception);
                }
            });
        });
    }

    function getData(taskID){
        let responseToSend = {};
        return new Promise(function(resolve,reject){
            getDataInput(taskID).then(function(dataInputResponse){
                responseToSend["dataInput"] = dataInputResponse;
                return getDataPhotos(taskID).then(function(dataPhotosResponse){
                    responseToSend["dataPhotos"] =  dataPhotosResponse;
                    resolve(responseToSend);
                }).catch(function(e){
                    console.error('An error ocurred on getData', e);
                    reject(e);
                });
            });
        });
    }

    function matchPDF() {
        let HTMLTextFileRetrieved;
        getRouteHTMLFile("Fumigacion-EVIDENCIAS-PODAS-Y-FUMIGACION").then(function (routeHTML) {
            console.log("getRouteHTMLFile Passed it",routeHTML);
            return getHTMLFile(routeHTML.file.attachment[0].batchId, routeHTML.file.attachment[0].attachmentId);
        }).then(function (HTMLTextFile) {
            HTMLTextFileRetrieved = HTMLTextFile;
            console.log("getHTMLFile Passed it");
            return getData("PM-20170525-00019");
        }).then(function(allDataAnswers){
            for (let data of allDataAnswers.dataPhotos){
                HTMLTextFileRetrieved.replace("${"+data.property+"}",data.value);
            }
            console.log("getData Passed it",allDataAnswers);
        }).catch(function (e) {
            console.error('An error ocurred', e);
        });
    }

    matchPDF();