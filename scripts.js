const csvApp = {};

csvApp.convertCSVToArr = function(CSVstring){
    const makeInteger = function(strToInt, index){
        if (index === 1){
            return strToInt;
        } else {
            return parseInt(strToInt);
        }
    }

    let CSVArray = [];
    const newArr = CSVstring.split("\r\n");
    newArr.forEach(item => {
        let subArr = item.split(";");
        subArr.forEach(value => {
            valIndex = subArr.indexOf(value);
            subArr[valIndex] = makeInteger(value, valIndex);
        });
        if (subArr.length === 3){
            CSVArray.push(subArr);
        }
    });
    return CSVArray;
}

csvApp.printValues = function(arrayToPrint, valueCount){
    let rowCount = 1;
    const myOutputEl = document.querySelector('.output');
    myOutputEl.style["background-color"] = "white";
    myOutputEl.innerHTML = "";
    // ===========================
    // =======HEADER ROW
    // ===========================
    const headerRow = document.createElement('div')
    headerRow.classList.add("outputRow", "outputRowEven", "headerRow"); //because zero is an even number, haha.....
    const headerColumns = [];

    for (k = 0; k <= valueCount; k++){
        const column = document.createElement('p');
        column.classList.add("outputColumn");
        if (k == 0) {column.innerText = "Row Number"}
        if (valueCount == 3){
            if (k == 1) {column.innerText = "Order ID"}
            if (k == 2) {column.innerText = "Product Number"}
            if (k == 3) {column.innerText = "Quantity"}
        } else {
            if (k == 1) {column.innerText = "Product Number"}
            if (k == 2) {column.innerText = "Quantity"}
        }
        headerColumns.push(column);
    }

    myOutputEl.append(headerRow);
    headerColumns.forEach(column =>{
        headerRow.append(column);
    });
    // ===========================
    // ===========================

    let startingCount = 0;
    let tallyBreakpoint = 100;
    let maxLength = arrayToPrint.length;
    const addMoreButton = document.createElement('button');

    const printCurrentCount = function(){
        if (tallyBreakpoint >= maxLength){
            tallyBreakpoint = maxLength;
            addMoreButton.classList.add("processButtonInvis");
        }

        for (j = startingCount; j < tallyBreakpoint; j++){
            const newRowEl = document.createElement('div');
            if (j%2 == 0){
                newRowEl.classList.add("outputRowOdd", "outputRow");
            } else {
                newRowEl.classList.add("outputRowEven", "outputRow");
            }
            myOutputEl.append(newRowEl);
            for (i=-1; i< valueCount; i++){
                const column = document.createElement('p');
                column.classList.add('outputColumn');
                if (i === -1){
                    column.innerText = rowCount;
                } else {
                    column.innerText = arrayToPrint[j][i];
                }
                newRowEl.append(column);
            }
            rowCount++;
        }
    }
    if (startingCount == 0){
        printCurrentCount();
    }

    const updateButton = function(){
        let remaining = maxLength - tallyBreakpoint;
        let renderCount = 100;
        if (remaining < 100){
            renderCount = remaining;
        }
        addMoreButton.innerText = `show next ${renderCount} of ${maxLength}`;
    }

    updateButton();
    addMoreButton.classList.add("showMoreButton")
    addMoreButton.addEventListener('click', function(){
        startingCount = tallyBreakpoint;
        tallyBreakpoint = tallyBreakpoint + 100;
        printCurrentCount();
        myOutputEl.append(addMoreButton);
        updateButton();
    });

    myOutputEl.append(addMoreButton);
}

csvApp.loadValues = function(mode, originalCSVArray){
    let CSVSortedArr = originalCSVArray.slice();
    let CSVCondensed = [];

    if (mode === 0 || mode === 2){
        CSVSortedArr.forEach(listItem =>{
            listItem[3] = parseInt(listItem[1].replace("Product_", ""), 10);
            mode = 3;
        });
    
        CSVSortedArr.sort(function(a,b){
            return a[mode] - b[mode];
        });

        let currentProductID = 0;
        let ongoingSum = 0;

        CSVSortedArr.forEach(sortedListItem =>{
            const productID = sortedListItem[3];
            const productCount = sortedListItem[2];

            if (productID === currentProductID){
                ongoingSum = ongoingSum + productCount;
            } else {
                CSVCondensed.push([currentProductID, ongoingSum]);
                ongoingSum = productCount;
                currentProductID = productID;
            }
        });

        CSVCondensed.sort(function(a,b){
            return b[1] - a[1];
        });
        CSVCondensed.forEach(listItem =>{
            const zeroStrCount = 5 - (String(listItem[0]).length)
            let zeroChar = "";
            for(i=0; i<zeroStrCount; i++){
                zeroChar = zeroChar + "0";
            }
            listItem[0] = "Product_" + zeroChar + listItem[0]; 
        });
        return CSVCondensed;
    } else {
        CSVSortedArr.sort(function(a,b){
            if (mode == 1){
                return b[0] - a[0];
            } else if (mode == 3){
                return b[2] - a[2];
            }
        });
        return CSVSortedArr;
    }
}

csvApp.downloadCSV = function(arrToDL){
    let infoToPush = [];

    arrToDL.forEach(listItem =>{
        listItem[0] = `"${listItem[0]}"`;
        infoToPush = infoToPush + listItem.join(";") + "\n";
    });

    let csvData = new Blob([infoToPush], {type: 'text/csv' });
    let csvUrl = URL.createObjectURL(csvData);

    let downloadLink = document.createElement('a'); //creates targetable element
    downloadLink.href = csvUrl;                     //link to the 'url' of the 'blob' holding the information
    downloadLink.target = '_blank';                 //opens new window
    downloadLink.download = "ABC" + ".csv";         //file name
    downloadLink.click();                           //clicks that target element automatically to trigger it

}

csvApp.buildGUI = function(){
    const processFileButton = document.querySelectorAll('.processButton');
    const optionsField = document.querySelector('.options');
    const myCSVFile = document.getElementById('fileSelector');
    const CSVReader = new FileReader();

    myCSVFile.onchange = function(e){
        const selectedCSV = myCSVFile.files;
        if (myCSVFile.files[0].type === "text/csv"){
            myCSVFile.style["background-color"] = "rgb(73, 218, 92)";
            optionsField.style["background-color"] = "white";
            for (i=0; i<processFileButton.length; i++){
            
                
                processFileButton[i].classList.remove("processButtonInvis");
                processFileButton[i].buttonMode = i;
                processFileButton[i].addEventListener('click', function(){
                    const mode = this.buttonMode;

                    for (file of selectedCSV){
                        CSVReader.readAsText(file);
                    }
                    CSVReader.addEventListener('load', function(e){
                        const CSVResultString = e.target.result;
                        let CSVArray = csvApp.convertCSVToArr(CSVResultString); 

                        const sortedArray = csvApp.loadValues(mode, CSVArray);
                        let printMethod = 0;
                        if (mode == 0){  
                            csvApp.downloadCSV(sortedArray);
                        } else {
                            if (mode == 1) { printMethod = 3 }
                            if (mode == 2) { printMethod = 2 }
                            if (mode == 3) { printMethod = 3 }
                            csvApp.printValues(sortedArray, printMethod);
                        }
                    });
                });
            }
        } else {
            myCSVFile.style["background-color"] = "rgb(235, 44, 44)";
        }
    }
}


csvApp.init = function(){
    csvApp.buildGUI();
}

csvApp.init(); 