const csvApp = {};

csvApp.convertCSVToArr = function(CSVstring){
    //Converts the initial CSV file into an array, returns it
    const makeInteger = function(strToInt, index){
        //simple function to convert string values in CSV to integers slightly more modular than manually targeting every index
        //incicies that are ignored as integers marked here -- ie (index === 1 || index === x etc..) - note array structure, ["int", "string+int", "int"] to [int, "string+int", int]
        if (index === 1){
            return strToInt;
        } else {
            return parseInt(strToInt);
        }
    }

    let CSVArray = [];
    const newArr = CSVstring.split("\r\n");
    //split returns array from string at split points, in this case carriage return and newline 
    newArr.forEach(item => {
        // takes the above array, and creates a nested array out of each index splitting at the ;
        let subArr = item.split(";");
        subArr.forEach(value => {
            //sends in the index and value to the integer function to clean up values for later
            valIndex = subArr.indexOf(value);
            subArr[valIndex] = makeInteger(value, valIndex);
        });
        if (subArr.length === 3){
            CSVArray.push(subArr);
        }
    });
    return CSVArray;
}

csvApp.printValues = function(arrayToPrint, numColumns){
    // handles the actual printing of the output values onto the page, this whole function is not part of the goal of the tech assessment but JS is good for handling visualization and it's good practice.  
    //arrayToPrint is the array we are printing - which has been sorted by csvApp.sortValues()
    //numColumns is passed in as a variable to adjust specific print methods based on the number of columns expected 
    
    const dataOutputEl = document.querySelector('.output');
    dataOutputEl.style["background-color"] = "white";
    dataOutputEl.innerHTML = ""; //resets render field between prints

    // =================================================
    // ====== HEADER ROW ===============================
    // =================================================
    // this whole block of code is just to handle the creation of the header lines on the printed output, it's more webdev than data movement, 
    // =================================================
    const headerRow = document.createElement('div')
    headerRow.classList.add("outputRow", "outputRowEven", "headerRow"); //because zero is an even number, hah.....
    const headerColumns = [];

    for (k = 0; k <= numColumns; k++){
        const column = document.createElement('p');
        column.classList.add("outputColumn");
        if (k == 0) {column.innerText = "Row Number"}
        if (numColumns == 3){
            //manual hardcoding of header labels based on what sort
            if (k == 1) {column.innerText = "Order ID"}
            if (k == 2) {column.innerText = "Product Number"}
            if (k == 3) {column.innerText = "Quantity"}
        } else {
            if (k == 1) {column.innerText = "Product Number"}
            if (k == 2) {column.innerText = "Quantity"}
        }
        headerColumns.push(column);
    }
    //append the header row to the output element, and then append each column 
    dataOutputEl.append(headerRow);
    headerColumns.forEach(column =>{
        headerRow.append(column);
    });
    // =======================================================

    let rowCount = 1; 
    let startingCount = 0;
    let tallyBreakpoint = 100;
    let maxLength = arrayToPrint.length;
    const addMoreButton = document.createElement('button'); 
    //this rebuilds the button in the correct spot on every re-render of the output list

    const printCurrentCount = function(){
        //heavy lifting of the output render.
            
        // the goal is to not blow up the browser by rendering huge number of lines of a CSV at once, so set a minimum value denoted by tallyBreakpoint (default 100)
            
            // if there are more than 100 lines remaining a button is created that will enable rendering more - in increments of (default) 100, 
            
                // if there are no more lines to render the button disappears by adding the class which makes it no longer display
            
            // a for loop nested in a for loop will create p elements that contain every value in the "line" array item within the overall array, 
                
                // the parent for loop runs through the rows, the nested loop creates the columns
            
                // the child elements are appropriately appended to parents - p (line items) to rows (newRowEl), rows to output field (dataOutputEl) 
                    
                    // these column values correspond to the array 'index position,' ie column 0 is index 0, column 1 is index 1, and because index -1 corresponds to nothing it can be used to create a manual column of row numbers 
            
            // when the addMoreButton button is pressed, it calls this function again but adjusts the startingcount and breakpoint by (default) 100, so the render builds the next 'set' of numbers.

        if (tallyBreakpoint >= maxLength){
            tallyBreakpoint = maxLength;
            addMoreButton.classList.add("processButtonInvis");
        }

        for (j = startingCount; j < tallyBreakpoint; j++){
            const newRowEl = document.createElement('div');
            // just adding styling to make rows alternate in colour
            if (j%2 == 0){
                newRowEl.classList.add("outputRowOdd", "outputRow");
            } else {
                newRowEl.classList.add("outputRowEven", "outputRow");
            }

            dataOutputEl.append(newRowEl);
            for (i=-1; i < numColumns; i++){
                const column = document.createElement('p');
                column.classList.add('outputColumn');
                // the -1 is to allow the function to 'cheat' the rownumber column into not being read as part of the array in the following conditional
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

    const updateButton = function(){
        // this function _only_ updates the text on the addMorebutton, so it shows how many more rows it will render
            // ie, it will render 100, and indicate such.  If there are fewer than 100 rows to render, it indicates how many
            // also notes how many rows total on the button by invoking the length of the starting array.
        let remaining = maxLength - tallyBreakpoint;
        let renderCount = 100;
        if (remaining < 100){
            renderCount = remaining;
        }
        addMoreButton.innerText = `show next ${renderCount} of ${maxLength}`;
    }

    addMoreButton.classList.add("showMoreButton");
    addMoreButton.addEventListener('click', function(){
        //when the add more button is invoked, update the starting render count to the previous breakpoint,
        //update the breakpoint to the next value (default 100)
        //re-render by calling print function, then add this button to the bottom, then update the button text.
        startingCount = tallyBreakpoint;
        tallyBreakpoint = tallyBreakpoint + 100;
        printCurrentCount();
        dataOutputEl.append(addMoreButton);
        updateButton();
    });

    if (startingCount == 0){
        //simply initializes the print function the first time, and only the first time, unless the addmorebutton is pressed
        printCurrentCount();
        // need to call once so the button text updates on the first render
        updateButton(); 
        // need to create the button on the first render
        dataOutputEl.append(addMoreButton);
    }
}

csvApp.sortValues = function(mode, originalCSVArray){
    // this handles the load of appropriately sorting the information from the array created from the CSV file in csvApp.convertCSVToArr(), namely which column we want to sort by
        
        // takes in the original array as originalCSVArray, and a mode

            // the mode refers to _how_ the list will be sorted, and is determined by which button is pressed:

                // the tech assessment calls for removing the ORDER ID from the sorted list if we sort by product, 
                    
                    // mode 0 and mode 2 are used for this instance, a conditional if searches for these two possibility(mode === 0 || mode === 2)

                // otherwise we want to maintain all columns and sort sequentially
                    
                    // all other modes are used in this case, a conditional if statement sort 
                
                // - mode 0 - reserved for sorting data for downloadable ABC.csv file appropriately
                // - mode 1 - sorts data by order ID
                // - mode 2 - sorts data by Product number _AND_ adds together quantities of similar products
                // - mode 3 - sorts data by overall quantity, from highest to lowest, for individual OrderID + Product pairings
                
                //=====================================================
                //=====================================================
                //=====       MODE 0 IS THE TECH ASSESSMENT       =====
                //=====       MODE 2 RENDERS THE SAME THING       =====
                //=====================================================
                //=====================================================
        
            // SORT LOGIC for MODE 0 and MODE 2 (ie, sort by Product and add values)
                // Copy the original array (originalCSVArray to CSVSortedArr) - memory references are ridiculous in JS through declarative equality, but it can be sliced with no parameters to quickly create a duplicate
                // declare an empty array (CSVCondensed) into which the final sorted/added values will be fed into
                // Take duplicate array and deal with the string aspect of the column to be sorted by
                    // we can target the index of that because we know the array is consistently formatted, it's always in index 1 (position "2")
                    // use the replace method to find and replace instances of "Product_" with the empty string, then parseInt the remaining value in base10, for ease of handling the array, we can put this value into a new index [3]
                // run the sort method on the array for index[3], which now contains integers of the product, this results in reordering the array from smallest productnumber to largest
                // because the products are now ordered, we also know that ALL SIMILAR PRODUCT IDS ARE NOW NEIGHBOURING and can sum up all 'quantities' for congruent products
                    // this is accomplished by creating a variable - currentProductID - to hold the current product being looked at in the sequence,
                    // another variable, ongoingSum, holds how many added qty's of that variable will exist at a time
                    // then go through the array of product IDs using a forEach method on CSVSortedArr, 
                    //
                    // - using the currentProductID and ongoingSum we look at the similar values, and add the count (denoted as productCount as a scoped variable for simplicity in the forEach), until it detects that the next product id IS NOT the same product id
                        // MUST set the starting value of currentProductID as the first value in the sorted array, or it creates a ghost "0,0" item 
                    // - at this point it pushes that product id (currentProductID) and the current tally (ongoingSum) into the new array of values (CSVCondensed), then resets the two variables with the next id/qty to be compared to following values
                    // - this works because it is CERTAIN the product id's are ordered  
                    // 
                // this new condensed array can then be sorted by the qty's,
                // the last step is preserving the "Product_" syntax that the output requires, 
                    // this is accomplished with a simple concatination onto that integer
                    // to maintain the leading 0's to match formatting the methos is to see how many digits different the product is from 5, and then write a for loop to add that many zeros onto the product id, and then add that into the "Product_" concat
                        // ie, str"Product_" + str"{number of zeroes req'd}" + qty (which is the first index of every 'line' subarray)
                // return this sorted and condensed array, which can then be rendered or downloaded as a .csv
                // ========
                // the second half of this, for all other modes, simply ignores the product column and sorts by either the order number or qty into the cloned array (CSVSortedArr).
                // it then returns the sorted array for rendering onto the output.  
            

    let CSVSortedArr = originalCSVArray.slice(); 
    let CSVCondensed = [];

    if (mode === 0 || mode === 2){
        // store the productid as an integer to be sorted reliably
        CSVSortedArr.forEach(listItem =>{
            listItem[3] = parseInt(listItem[1].replace("Product_", ""), 10);
        });
    
        CSVSortedArr.sort(function(a,b){
            // sort by the productid integer
            return a[3] - b[3];
        });

        let currentProductID = CSVSortedArr[0][3];
        let ongoingSum = 0;

        CSVSortedArr.forEach(sortedListItem =>{
            // groups like products and sums their qtys, then pushes to array CSVCondensed
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
            // sorts the condensed array by qty
            return b[1] - a[1];
        });
        CSVCondensed.forEach(listItem =>{
            // adds on the leading zeros as a string, after determining how many there are
            const zeroStrCount = 5 - (String(listItem[0]).length)
            let zeroChar = "";
            for(i=0; i<zeroStrCount; i++){
                zeroChar = zeroChar + "0";
            }
            listItem[0] = "Product_" + zeroChar + listItem[0]; 
        });
        return CSVCondensed;
    } else {
        // doesn't do any condensing, simply sorts by ORDERID or QTY and returns that array to be rendered.
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
    // handles writing the writing to a new file
    let infoToPush = [];

    arrToDL.forEach(listItem =>{
        // go through every item in the array, join the subarray (listItem) together using the seperator (;), with a newline character at the end and add it to an array object to be written to a file 
        listItem[0] = `"${listItem[0]}"`;
        infoToPush = infoToPush + listItem.join(";") + "\n";
    });

    let csvData = new Blob([infoToPush], {type: 'text/csv' });
    let csvUrl = URL.createObjectURL(csvData);
    // creates a new 'text file' with a pathway to that new file

    let downloadLink = document.createElement('a'); 
    downloadLink.href = csvUrl;                     
    downloadLink.target = '_blank';                 
    downloadLink.download = "ABC" + ".csv";         
    downloadLink.click();                           
    //this is JS being ridiculous, the way to actually initialize the download is to create an anchor element that links to that file pathway which is automatically tripped when this function runs.
}

csvApp.buildGUI = function(){
    // this function creates the elements that will be interacted with, and populates them with functionality
    // FileReader is used to read the files, delcared as CSVReader
        // when the input element, myCSVFile, detects a change, save the files as a variable (selectedCSV)
        // files have a weird quirk where they are stored in an array, and that array cannot be easily worked with
            // either iterate through through in a for-of loop, or if there is only one file it can be accessed using index[0].  Latter is used for styling purposes, former is used for usage
        // detecting a change also causes buttons to appear, those buttons are given a listener that triggers the sort process
            // which sort is done depends on the buttons index number - namely, when the buttons are selected using queryselectorall (it finds all buttons), we can give the buttons a 'mode' determined by their ordered index, this mode can be used to build functionality that will ultimately tell the button what it will sort, and what it will do with the information afterwards.
                // there will be no repeated functionality because the indices are unique.
            // 
    const processFileButton = document.querySelectorAll('.processButton');
    const optionsField = document.querySelector('.options');
    const myCSVFile = document.getElementById('fileSelector');
    const CSVReader = new FileReader();

    myCSVFile.onchange = function(e){
        const selectedCSV = myCSVFile.files;
        if (myCSVFile.files[0].type === "text/csv"){
            myCSVFile.style["background-color"] = "rgb(73, 218, 92)";
            optionsField.style["background-color"] = "white";
            // styling, if the file is a csv it's green and lets the user go to the next step, otherwise it's red. 

            for (i=0; i<processFileButton.length; i++){
                //using for loop instead of forEach so the index can be assigned for 'mode' functionality
                
                processFileButton[i].classList.remove("processButtonInvis");
                processFileButton[i].buttonMode = i;
                processFileButton[i].addEventListener('click', function(){
                    const mode = this.buttonMode;
                    //allows access to mode within the button without fighting with memory references

                    for (file of selectedCSV){
                        // for-of or index referenced required to access file -- could also use `CSVReader.readAsText(myCSVFile.files[0])` instead.  
                        CSVReader.readAsText(file);
                    }

                    CSVReader.addEventListener('load', function(e){
                        // when the reader detects it's reading a file, it then takes that file and puts it into a plaintext string called CSVResultString
                            // this string is fed into the convertCSVToArr function to return an array
                            // that array will be fed to the sort function, which will sort based on the button pressed, and then sent either to the printValues function or the downloadCSV function depending on the button pressed.
                        const CSVResultString = e.target.result;
                        let CSVArray = csvApp.convertCSVToArr(CSVResultString); 

                        const sortedArray = csvApp.sortValues(mode, CSVArray);
                        let numColumns = 0;
                        if (mode == 0){  
                            csvApp.downloadCSV(sortedArray);
                        } else {
                            if (mode == 1) { numColumns = 3 }
                            if (mode == 2) { numColumns = 2 }
                            if (mode == 3) { numColumns = 3 }
                            csvApp.printValues(sortedArray, numColumns);
                        }
                    });
                });
            }
        } else {
            myCSVFile.style["background-color"] = "rgb(235, 44, 44)";
            processFileButton.forEach(button =>{
                button.classList.add("processButtonInvis");
            })
        }
    }
}

csvApp.init = function(){
    csvApp.buildGUI();
}

csvApp.init(); 