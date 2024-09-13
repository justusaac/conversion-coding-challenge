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