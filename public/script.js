const socket = io();

socket.on('updateData', data => {
    console.log(data);
    var plotData = [data];
      
    Plotly.newPlot('graph1', plotData);
});

  
  