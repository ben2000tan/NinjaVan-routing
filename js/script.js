function loaddata(){
$.ajax({
    url:"test.csv",
    dataType:"text",
    success:function(data){
        var employee_data = data.split(/\r?\n|\r/);
        var table_data = `
        <table id = "table" class="table">
            <thead class="table-dark">
                <tr>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Postal Code</th>
                </tr>
            </thead>
            <tbody>`;
        for(var count = 1; count<10; count++){
            var cell_data = employee_data[count].split(",");

            table_data += '<tr>';
                for(var cell_count=0; cell_count<cell_data.length; cell_count++){
                    if (count>0){
                        if (cell_count == 3){
                            var timestart = cell_data[cell_count];
                            var data = timestart.replace(/"/g,"");
                            table_data += '<td>'+data+'</td>';
                        }else if (cell_count == 4){
                            var timeend = cell_data[cell_count];
                            var data = timeend.replace(/"/g,"");
                            table_data += '<td>'+data+'</td>';
                        }else if (cell_count == 9){
                            var postal_code = cell_data[cell_count];
                            var data = postal_code.replace(/"/g,"");
                            table_data += '<td>'+data+'</td>';
                        }
                    }
                }
            table_data += '</tr>';
        }
        table_data += `</tbody></table>`;
        
        $('#tabledata').html(table_data);

        
    },
    complete: function(){

            const table = document.getElementById('table');

            let draggingEle;
            let draggingRowIndex;
            let placeholder;
            let list;
            let isDraggingStarted = false;

            // The current position of mouse relative to the dragging element
            let x = 0;
            let y = 0;

            // Swap two nodes
            const swap = function (nodeA, nodeB) {
                const parentA = nodeA.parentNode;
                const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

                // Move `nodeA` to before the `nodeB`
                nodeB.parentNode.insertBefore(nodeA, nodeB);

                // Move `nodeB` to before the sibling of `nodeA`
                parentA.insertBefore(nodeB, siblingA);
            };

            // Check if `nodeA` is above `nodeB`
            const isAbove = function (nodeA, nodeB) {
                // Get the bounding rectangle of nodes
                const rectA = nodeA.getBoundingClientRect();
                const rectB = nodeB.getBoundingClientRect();

                return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
            };

            const cloneTable = function () {
                const rect = table.getBoundingClientRect();
                const width = parseInt(window.getComputedStyle(table).width);

                list = document.createElement('div');
                list.classList.add('clone-list');
                list.style.position = 'absolute';
                list.style.left = `${rect.left}px`;
                list.style.top = `${rect.top}px`;
                table.parentNode.insertBefore(list, table);

                // Hide the original table
                table.style.visibility = 'hidden';

                table.querySelectorAll('tr').forEach(function (row) {
                    // Create a new table from given row
                    const item = document.createElement('div');
                    item.classList.add('draggable');

                    const newTable = document.createElement('table');
                    newTable.setAttribute('class', 'clone-table');
                    newTable.style.width = `${width}px`;

                    const newRow = document.createElement('tr');
                    const cells = [].slice.call(row.children);
                    cells.forEach(function (cell) {
                        const newCell = cell.cloneNode(true);
                        newCell.style.width = `${parseInt(window.getComputedStyle(cell).width)}px`;
                        newRow.appendChild(newCell);
                    });

                    newTable.appendChild(newRow);
                    item.appendChild(newTable);
                    list.appendChild(item);
                });
            };

            const mouseDownHandler = function (e) {
                // Get the original row
                const originalRow = e.target.parentNode;
                draggingRowIndex = [].slice.call(table.querySelectorAll('tr')).indexOf(originalRow);

                // Determine the mouse position
                x = e.clientX;
                y = e.clientY;

                // Attach the listeners to `document`
                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            };

            const mouseMoveHandler = function (e) {
                if (!isDraggingStarted) {
                    isDraggingStarted = true;

                    cloneTable();

                    draggingEle = [].slice.call(list.children)[draggingRowIndex];
                    draggingEle.classList.add('dragging');

                    // Let the placeholder take the height of dragging element
                    // So the next element won't move up
                    placeholder = document.createElement('div');
                    placeholder.classList.add('placeholder');
                    draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
                    placeholder.style.height = `${draggingEle.offsetHeight}px`;
                }

                // Set position for dragging element
                draggingEle.style.position = 'absolute';
                draggingEle.style.top = `${draggingEle.offsetTop + e.clientY - y}px`;
                draggingEle.style.left = `${draggingEle.offsetLeft + e.clientX - x}px`;

                // Reassign the position of mouse
                x = e.clientX;
                y = e.clientY;

                // The current order
                // prevEle
                // draggingEle
                // placeholder
                // nextEle
                const prevEle = draggingEle.previousElementSibling;
                const nextEle = placeholder.nextElementSibling;

                // The dragging element is above the previous element
                // User moves the dragging element to the top
                // We don't allow to drop above the header
                // (which doesn't have `previousElementSibling`)
                if (prevEle && prevEle.previousElementSibling && isAbove(draggingEle, prevEle)) {
                    // The current order    -> The new order
                    // prevEle              -> placeholder
                    // draggingEle          -> draggingEle
                    // placeholder          -> prevEle
                    swap(placeholder, draggingEle);
                    swap(placeholder, prevEle);
                    return;
                }

                // The dragging element is below the next element
                // User moves the dragging element to the bottom
                if (nextEle && isAbove(nextEle, draggingEle)) {
                    // The current order    -> The new order
                    // draggingEle          -> nextEle
                    // placeholder          -> placeholder
                    // nextEle              -> draggingEle
                    swap(nextEle, placeholder);
                    swap(nextEle, draggingEle);
                }
            };

            const mouseUpHandler = function () {
                // Remove the placeholder
                placeholder && placeholder.parentNode.removeChild(placeholder);

                draggingEle.classList.remove('dragging');
                draggingEle.style.removeProperty('top');
                draggingEle.style.removeProperty('left');
                draggingEle.style.removeProperty('position');

                // Get the end index
                const endRowIndex = [].slice.call(list.children).indexOf(draggingEle);

                isDraggingStarted = false;

                // Remove the `list` element
                list.parentNode.removeChild(list);

                // Move the dragged row to `endRowIndex`
                let rows = [].slice.call(table.querySelectorAll('tr'));
                draggingRowIndex > endRowIndex
                    ? rows[endRowIndex].parentNode.insertBefore(rows[draggingRowIndex], rows[endRowIndex])
                    : rows[endRowIndex].parentNode.insertBefore(
                        rows[draggingRowIndex],
                        rows[endRowIndex].nextSibling
                    );

                // Bring back the table
                table.style.removeProperty('visibility');

                // Remove the handlers of `mousemove` and `mouseup`
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };

            table.querySelectorAll('tr').forEach(function (row, index) {
                // Ignore the header
                // We don't want user to change the order of header
                if (index === 0) {
                    return;
                }

                const firstCell = row.firstElementChild;
                firstCell.classList.add('draggable');
                firstCell.addEventListener('mousedown', mouseDownHandler);
            });
    }
});
}


var map;
var waypoints;
function initMap() {
var mapLayer = document.getElementById("map-layer"); 
var centerCoordinates = new google.maps.LatLng(1.3521, 103.8198);
var defaultOptions = { center: centerCoordinates, zoom: 12 }
map = new google.maps.Map(mapLayer, defaultOptions);

var directionsService = new google.maps.DirectionsService;
var directionsDisplay = new google.maps.DirectionsRenderer;
directionsDisplay.setMap(map);

$("#go").on("click",function() {
    waypoints = Array();
    $('.way_points:checked').each(function() {
    var latLng=$(this).val().split(",");
    waypoints.push({
        location: {lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1])},
        // location: $(this).val(),
        stopover: true
        });
    // console.log($(this).val()); //lat,lon
    });


    const rows = document.querySelectorAll("table > tbody > tr");
    for(let i = 0; i < rows.length; i++){
        console.log(rows[i].getElementsByTagName("td")[2].innerText);
        var postal=rows[i].getElementsByTagName("td")[2].innerText;
        waypoints.push({
        location: postal,
        stopover: true
        });
    }


    var locationCount = waypoints.length;
    if(locationCount > 0) {
        var start = waypoints[0].location;
        var end = waypoints[locationCount-1].location;
        drawPath(directionsService, directionsDisplay,start,end);
    }
});

}
function drawPath(directionsService, directionsDisplay,start,end) {
    directionsService.route({
        origin: start,
        destination: end,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
            console.log(response.routes[0].legs) // all the legs
            var arr = response.routes[0].legs
            
            var table = `
                        <h1>Results</h1>
                        <table class="table">
                            <thead class="table-dark">
                                <tr>
                                    <th>S/N</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Distance</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>`
            var count = 1;

            for (let i = 1; i < arr.length - 1 ; i++ ) {
                var directionsData = response.routes[0].legs[i]; // Get data about the mapped route
                if (!directionsData) {
                    window.alert('Directions request failed');
                    return;
                }
                else {
                    table += `
                            <tr>
                                <td>${count}</td>
                                <td>${directionsData.start_address}</td>
                                <td>${directionsData.end_address}</td>
                                <td>${directionsData.distance.text}</td>
                                <td>${directionsData.duration.text}</td>
                            </tr>
                    `
                    count++;
                }
            }
            table += "</table>"
            document.getElementById('msg').innerHTML = table;
        } else {    
            window.alert('Problem in showing direction due to ' + status);
        }
    });
}


function hello() {
    const rows = document.querySelectorAll("table > tbody > tr");
    // console.log(rows);
    for(let i = 0; i < rows.length; i++){
        console.log(rows[i].getElementsByTagName("td")[0].innerText);
        console.log(rows[i].getElementsByTagName("td")[1].innerText);
        console.log(rows[i].getElementsByTagName("td")[2].innerText);
        console.log("-----end-----")
    }
}
