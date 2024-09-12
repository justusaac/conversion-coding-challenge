function populate(targets, values){
	for(const select of targets){
		select.innerHTML = '';
		for(const value of values){
			const option = document.createElement('option');
			option.innerHTML = value;
			option.value = value;
			select.appendChild(option);
		}
		//Trigger the onchange handler with the first option
		select.selectedIndex = 0;
		select.dispatchEvent(new Event('change'));
	}
}
function populate_measurements(){
	fetch('measurements').then(response => response.json()).then(measurements => {
		populate(document.getElementsByClassName('measurement-select'), measurements);
	});
}
function populate_units(measurement){
	fetch(`units?measurement=${measurement}`).then(response => response.json()).then(units => {
		populate(document.getElementsByClassName('unit-select'), units);
	});
}