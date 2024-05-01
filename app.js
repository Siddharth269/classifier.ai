Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        var url = "http://127.0.0.1:5000/classify_image"

        $.post(url, {
            image_data: file.dataURL
        },function(data, status) {
            /* 
            Below is a sample response if you have two faces in an image lets say Bernard and Bill together.
            Most of the time if there is one person in the image you will get only one element in below array
            data = [
                {
                    class: "Bernard_Arnault",
                    class_probability: [90.45, 1.64, 2.47, 2.52, 2.92],
                    class_dictionary: {
                         Bernard_Arnault: 0, 
                         Bill_Gates: 1,
                         Elon_Musk: 2,
                         Jeff_Bezos: 3,
                         Mark_Zuckerberg: 4
                        
                    
                    }
                },
                {
                    class: "Bill_Gates",
                    class_probability: [2.23, 94.43, 1.72, 0.77, 0.85],
                    class_dictionary: {
                        Bernard_Arnault: 0, 
                        Bill_Gates: 1,
                        Elon_Musk: 2,
                        Jeff_Bezos: 3,
                        Mark_Zuckerberg: 4 
                    }
                },


                {
                    class: "Elon_Musk",
                    class_probability: [0.37, 0.81, 92.02, 2.29, 4.52],
                    class_dictionary: {
                        Bernard_Arnault: 0, 
                        Bill_Gates: 1,
                        Elon_Musk: 2,
                        Jeff_Bezos: 3,
                        Mark_Zuckerberg: 4 
                    }
                },

                {
                    class: "Jeff_Bezos",
                    class_probability: [2.57, 1.31, 1.72, 92.12, 2.27],
                    class_dictionary: {
                        Bernard_Arnault: 0, 
                        Bill_Gates: 1,
                        Elon_Musk: 2,
                        Jeff_Bezos: 3,
                        Mark_Zuckerberg: 4 
                    }
                },

                {
                    class: "Mark_Zuckerberg",
                    class_probability: [0.73, 2.49, 1.48, 3.21, 92.08],
                    class_dictionary: {
                        Bernard_Arnault: 0, 
                        Bill_Gates: 1,
                        Elon_Musk: 2,
                        Jeff_Bezos: 3,
                        Mark_Zuckerberg: 4 
                    }
                }


            ]*/
            
            console.log(data);
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }
            let players = ["Bernard_Arnault", "Bill_Gates", "Elon_Musk", "Jeff_Bezos", "Mark_Zuckerberg"];
            
            let match = null;
            let bestScore = -1;
            for (let i=0;i<data.length;++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass>bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                let classDictionary = match.class_dictionary;
                for(let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(proabilityScore);
                }
            }
            // dz.removeFile(file);            
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});