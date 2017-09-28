$(document).ready(function() {
    appRoot = function () {
        init: {
            autocompletePerson: (function () {  //Кастомный AutoComlete
                $.widget("custom.autocomletePerson", $.ui.autocomplete, {
                    _renderItem: function(ul, item) {
                        let html = `<p>${item.label}  <strong>Дата: ${item.datePerson}</strong>  <em>${item.position}</em></p>`;
                        return $("<li></li>").data("item.autocomplete", {
                            label: item.label,
                            value: item.label,
                        }).append(html).appendTo(ul);
                    }
                });
            }())
        };
        main:{
            datePiker: (function () {
                $.datepicker.regional['ru'] = {  // ????? Руссификация плагина datePicker
                    closeText: 'Закрыть',
                    prevText: '&#x3c;Пред',
                    nextText: 'След&#x3e;',
                    currentText: 'Сегодня',
                    monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
                        'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
                    monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
                        'Июл','Авг','Сен','Окт','Ноя','Дек'],
                    dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
                    dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
                    dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
                    dateFormat: 'dd.mm.yy',
                    firstDay: 1,
                    isRTL: false
                };
                $.datepicker.setDefaults( $.datepicker.regional["ru"] );
            }());
        };
        /*****************************************Event BEGIN****************************************/
        event= (function () {

			$('#sort_name').on('click', function () { // Сортировка ФИО
				controller.sortName();
            });

			$('#sort_deportment').on('click',function () { // Сортировка отдела
                controller.sortDeportment();
            });

			$('#sort_status').on('click',function () { //Сортировка статуса
				controller.sortStatus();
            });

            $('.modal').on('click', function() {
                controller.createForm(controller.addRegContent());
            });

            $('#modal_close, #overlay').on('click', function() { // Закрыть модальное окно
                $('#modal_form')
                    .animate({opacity: 0, top: '45%'}, 200, function(){
                            $(this).css('display', 'none');
                            $('#overlay').fadeOut(400);
                        	$('.content').remove('');
                    });

            });
            $('#modal_form').on('click','#regPerson',function () { // Открыть модальное окно
                $('#modal_form')
                    .animate({opacity: 0, top: '45%'}, 200, function(){
                        $(this).css('display', 'none');
                        $('#overlay').fadeOut(400);
                        $('.content').remove('');
                    });
            });
            $('.table table').on('click','#change',function () { // Октрыть модальное окно с подгруженными данными в форму
            	let that = this;
            	model.changePerson(that,controller.addChengeContent);
            });
			$('#modal_form').on('click','#changePerson',function () { // Применить изменения
				let id = parseInt($(this).parent().attr('id').slice(3));
                $('#modal_form')
                    .animate({opacity: 0, top: '45%'}, 200, function(){
                        $(this).css('display', 'none');
                        $('#overlay').fadeOut(400);
                        $('.content').remove('');
                    });
				let dataForm = model.getDataForm(true);
                model.changePersonStore(dataForm,id);
                controller.search();
            });
			$('#search_button').on('click',function () {
				controller.searchPersonInput()
            });
			$('.table table').on('click','#shift',function () {
                let that = this;
                model.changePerson(that,controller.addDeprtmentContent)
            });
            $('#modal_form').on('click','#shift_person',function () { // Применить изменения
                let id = parseInt($(this).parent().attr('id').slice(3));
                $('#modal_form')
                    .animate({opacity: 0, top: '45%'}, 200, function(){
                        $(this).css('display', 'none');
                        $('#overlay').fadeOut(400);
                        $('.content').remove('');
                    });
                let dataForm = model.getDataForm(true);
			    model.shiftPerson(dataForm,id);
			    console.log(id);
                controller.search();
            });

        }());
        /**************************************Event END**********************************************************/
    }
    appRoot();
	/********************************************Model BEGIN************************************************/
	model = {

		setLocalStore: function (url) {  /// Добавление данных в локальное хранилище URL: String
            $.ajax({
				url: url,
				type: 'GET',
				async: false,
				success: function (data,textStatus,jqXHR) {
                    let dataString = JSON.stringify(data);
                    localStorage.setItem('person', dataString);
                }
			})
        },
        searchPersonId: function (id) { // Ищет персону по id return: object
            let data = model.getLocalStoreJSON();
            for (let i of data){
                if(i.id === parseInt(id)){
                    return i;
                }
            }
        },
		getLocalStoreJSON: function () {  //// Берет данные из localStore return: Object
			if(localStorage.person){
				console.log('Get JSON LocalStore');
                return JSON.parse(localStorage.person);
			}else{
				console.log('Get JSON server');
				this.setLocalStore('/person');
                return JSON.parse(localStorage.person);
			}
        },
		getLocalStoreArray: function () {  /// Берет данные из localStore return: Array . ? Для работы с поиском
			let data = [];
			for (let i of this.getLocalStoreJSON() ) {
                data.push({label:i.lastName + ' ' + i.firstName + ' ' + i.surname, datePerson: i.datePerson, position: i.position})
            }
			return data;
        },
		changeLocalStore: function (obj) { // Изменение всего локального хранилища
			localStorage.removeItem('person');
			localStorage.person = JSON.stringify(obj);
        },
		getInputDate: function () { //Берет дату с datePicker
			return $('#datepicker').val();
        },
        convertInputDate: function () { // Конвертирует дату в ISO8601
			return $.datepicker.parseDate('dd.mm.yy', model.getInputDate())
		},
        languageValidate: function (sel,n) {
            $(sel).keyup(function () {
                this.value = this.value.replace(/[^а-яё]/ig, '');
                this.value = this.value.substr(0,n);
            });
        },
		addTableElement: function (obj) { // Добавление персоны в таблицу
			$('.table table').append(`
				<tr id="${obj.id}">
					<td class="deportment ${ (obj.cloneLastItem === true)? 'cloneLastItem': '' }">${ (obj.cloneLastItem === true)? '' : obj.deportment }</td>
					<td class="name">${obj.lastName + ' ' + obj.firstName + ' ' + obj.surname}</td>
					<td class="datePerson">${obj.datePerson}</td>
					<td class="position">${obj.position}</td>
					<td class="status">${ obj.status === true ? 'Работает': 'Уволен'}</td>
					<td class="active-button">
						<span id="shift" title="Переместить сотрудника в другой отдел">Переместить</span><br>
						<span id="change" title="Редактировать сотрудника">Редактировать</span>
						${obj.status === true ? "<span class='change_status' title='Уволить сотрудника'>Уволить</span>" : "<span class='change_status' title='Востановить сотрудника'>Востановить</span>"}
					</td>
				</tr>
			`);
        },
		changeStatusPersonStore: function (id) {  // Меняет статус персоны в локальном хранилище
			let data = model.getLocalStoreJSON();
			for(let i in data){
				if(data[i].id === parseInt(id)){
					data[i].status = !data[i].status;
					this.changeLocalStore(data);
				}
			}
        },
		sortRulesName: function (statusA, statusB) { //Правила сортировки по ФИО
            let name = {
                lastA: statusA.lastName.slice(0,1),
                lastB: statusB.lastName.slice(0,1),
                firstA: statusA.firstName.slice(0,1),
                firstB: statusB.firstName.slice(0,1),
                surA: statusA.surname.slice(0,1),
                surB: statusB.surname.slice(0,1),
            };

            if (localStorage.nameSort){
                if (name.lastA < name.lastB) return -1;
                if (name.lastA > name.lastB) return 1;
                if(name.lastA === name.lastB){
                    if (name.firstA < name.firstB) return -1;
                    if (name.firstA > name.firstB) return 1;
                    if (name.firstA === name.firstB){
                        if (name.surA < name.surB) return -1;
                        if (name.surB > name.surB) return 1;
                        return 0;
                    }
                }
            }else{
                if (name.lastA < name.lastB) return 1;
                if (name.lastA > name.lastB) return -1;
                if(name.lastA === name.lastB){
                    if (name.firstA < name.firstB) return 1;
                    if (name.firstA > name.firstB) return -1;
                    if (name.firstA === name.firstB){
                        if (name.surA < name.surB) return 1;
                        if (name.surB > name.surB) return -1;
                        return 0;
                    }
                }
            }
        },
		sortRulesDeportment: function (depA,depB) {
            if (depA.deportment < depB.deportment) return -1;
            if (depA.deportment > depB.deportment) return 1;
            return 0;
        },
        sortRulesStatus: function (depA,depB) {
            if (localStorage.sortStatus){
                if (depA.status < depB.status) return -1;
                if (depA.status > depB.status) return 1;
                return 0;
            }else {
                if (depA.status < depB.status) return 1;
                if (depA.status > depB.status) return -1;
                return 0;
            }
        },
		refreshAfteSort: function (person) {  // Обновление таблици с новой сортировкой
            model.changeLocalStore(person);
            $('.table table > tr').detach();
            controller.addTableElements();
        },
        funcModelForm: function (cb) {  /// Функционал модального окна
            $('#overlay').fadeIn(400, function () {
                $('#modal_form')
                    .css('display', 'block')
                    .animate({opacity: 1, top: '50%'}, 200);
                cb()
            });
        },
		checkValidPhone: function (phone,data) { // Валидирует Номер телефона

            if (phone.length === 11){
                for (let i of data){
                    if (i.phone_number.slice(1) === phone.slice(1)){
                        return true
                    }
                }
            }else {
                return true;
            }

        },
        getDataForm: function (what,idPerson) {  /// Собирает данные с формы и валидирует их return: Object
            let data = {};
            let dataLocalStore = model.getLocalStoreJSON();
            let id = what === true ? dataLocalStore.length  : idPerson;
            console.log(id);
            let selectors = ['input', 'select'];
            let nameAttr;
            let error = false;

            data.id = id;
            for (let i of selectors){
                $('.content '+ i).each(function (i, el) {
                    nameAttr = $(el).attr('name');
                    if (nameAttr === 'status'){
                        data[nameAttr] = !!$(el).val();
					}else if(nameAttr === 'phone_number'){
                        let phoneForm = $(el).val().replace(/[^0-9]/g,'');
                        if(!what){
                            if(model.checkValidPhone(phoneForm, dataLocalStore)){
                                $(el).addClass('error');
                                error = true;
                            }else{
                                data[nameAttr] = phoneForm;
                            }
                        }else{
                            data[nameAttr] = phoneForm;
                        }

                    }else if(nameAttr === 'lastName' || nameAttr === 'firstName'){

                        if ($(el).val().length <= 2 || $(el).val().length >= 15){
                            error = true;
                            $(el).addClass('error');
                        }else{
                            data[nameAttr] = $(el).val().charAt(0).toUpperCase() + $(el).val().slice(1);
                        }
                    }else if(nameAttr === 'datePerson'){
                        if ($(el).val().length<=0){
                            error = true;
                            $(el).addClass('error');
                        }else{
                            data[nameAttr] = $(el).val();
                        }
                    }else if (nameAttr === 'surname'){
                        data[nameAttr] = $(el).val().charAt(0).toUpperCase() + $(el).val().slice(1);
                    }else {
                        data[nameAttr] = $(el).val();
					}

                });
            }
			if(!what){
                if (error) return null;
            }
			return data;
        },

		changePerson: function (that,content) {
            let id = $(that).parent().parent().attr('id');
            console.log(id);
            let data = model.searchPersonId(id);
            controller.createForm(content(data));
            $('#status').val(data.status+'');
            $("#deportment_select").val(data.deportment+'');
            controller.validateSelect();
            $('#position_select').val(data.position+'');
        },
		changePersonStore: function (data,id) {
			data.id = id;
			let property= [
				"firstName",
                "lastName",
                "surname",
                "datePerson",
                "deportment",
                "position",
                "phone_number",
                "status",
			];
			let storeData = model.getLocalStoreJSON();
			for (let i in storeData){
				if(storeData[i].id === data.id){
					console.log('Нашел');
					for(let z of property){
						console.log(storeData[i][z], data[z]);
                        storeData[i][z] = data[z];
					}

				}
			}
			console.log(storeData);
			model.refreshAfteSort(storeData);
        },
		shiftPerson: function (data,id) {
            data.id = id;
            let storeData = model.getLocalStoreJSON();
            for (let i in storeData){
                if(storeData[i].id === data.id){
                    console.log('Нашел');
                    storeData[i].deportment = data.deportment;
                    storeData[i].position = data.position;
                }
            }
            model.refreshAfteSort(storeData);
        }

	};

	/*************************************Model END*******************************************************/

	/************************************Controller BEGIN************************************************/
	controller = {
		search: function () {
			$('#search').autocomletePerson({
                delay: 0,
				source: model.getLocalStoreArray(),
			})
        },
		searchPersonInput: function () { // Поиск персоны и сортировка таблици
			let data = model.getLocalStoreJSON();
			let valSearch = $('#search').val();

            function sortRulesName (statusA, statusB) { //Правила сортировки по ФИО
				statusB = valSearch.split(' ');
                if (statusA.lastName === statusB[0]) return -1;
                return 1;
            }
            data.sort(sortRulesName);
			model.refreshAfteSort(data);
        },
		validateInput: function () { // Валидация инпутов
			model.languageValidate('#firstName',15);
            model.languageValidate('#lastName',15);
        }(),

		addTableElements: function () { // Создать таблицу
			let data = model.getLocalStoreJSON();
			let lastData = '';
			for (let i of data){
				if (lastData === i.deportment){
                    lastData = i.deportment;
					i.cloneLastItem = true;
                    model.addTableElement(i);
                }else{
                    lastData = i.deportment;
                    model.addTableElement(i);
                }
			}
        },
		changeStatusPerson: function () {  // Изменение статуса персоны в представление
			$('.table table').on('click','.change_status',function () {
				let attr = $(this).attr('class');
				let idPerson = $(this).parent().parent().attr('id');
				let textStatus = $('#'+idPerson +' .status').text();
				if('change_status' === attr ){
					model.changeStatusPersonStore(idPerson);
					if(textStatus === "Работает"){
                        $('#'+idPerson +' .status').text('Уволен');
                        $('#'+idPerson + ' .change_status').text('Востановить')
					}else{
                        $('#'+idPerson +' .status').text('Работает');
                        $('#'+idPerson + ' .change_status').text('Уволить')
                    }
				}
            })
        },
        sortName: function () { // Сортирует таблицу по ФИО в localStore и view
            let person = model.getLocalStoreJSON();
            person.sort(model.sortRulesName);
            if(localStorage.nameSort){
                console.log('sn true');
                localStorage.setItem('nameSort','');
            }else{
                console.log('sn false');
                localStorage.setItem('nameSort', true);
            }
            model.refreshAfteSort(person);
        },
        sortDeportment: function () {  //Сортировка объекта по отделу
            let person = model.getLocalStoreJSON();
            person.sort(model.sortRulesDeportment);
            model.refreshAfteSort(person);
        },
		sortStatus: function () { // Сортировка объекта по статусу
            let person = model.getLocalStoreJSON();
            person.sort(model.sortRulesStatus);
            if(localStorage.sortStatus){
                console.log('sn true');
                localStorage.setItem('sortStatus','');
            }else{
                console.log('sn false');
                localStorage.setItem('sortStatus', true);
            }
            model.refreshAfteSort(person);
        },
		validateSelect: function () { // Динамическая подставка значений под селектор 
            let valSelector = $('#deportment_select').val();
            $('#position_select option').remove();
            if(valSelector === 'Офис'){
                $('#position_select').append(`
							<option>Руководитель</option>
							<option>Менеджер</option>
                    	`)
            }if (valSelector === 'Склад'){
                $('#position_select').append(`
							<option>Приемщик</option>
							<option>Кладовщик</option>
                    	`)
            }if (valSelector === 'Охрана'){
                $('#position_select').append(`<option>Охранник</option>`)
            }
        },
		addRegContent: function () {
            $('#modal_form').append(`
				<div class="content">
					<input type="text" name="lastName" class="name-inForm" id="lastName" placeholder="Фамилия" maxlength="15">
					<input type="text" name="firstName" class="name-inForm" id="firstName" placeholder="Имя" maxlength="15">
					<input type="text" name="surname" class="name-inForm" id="surname" placeholder="Отчество" maxlength="15">
					<input id="datepicker" readonly="true" name="datePerson" placeholder="Дата рождения">
					<select id="deportment_select" name="deportment">
						<option value="Офис">Офис</option>
						<option value="Склад">Склад</option>
						<option value="Охрана">Охрана</option>
					</select>
					<select id="position_select" name="position">
						<option>Руководитель</option>
						<option>Менеджер</option>
					</select>
					<input type="text" id="phone_mask" name="phone_number" placeholder="Номер телефона">
					<select id="status" name="status">
						<option value="true">Работает</option>
						<option value="false">Уволен</option>
					</select>
					<button id="regPerson">Добавить сотрудника</button>
				</div>
			`);
			$('#regPerson').on('click', function () {
                let dataForm = model.getDataForm(true);
                if (dataForm){
                    let data = model.getLocalStoreJSON();
                    data.push(dataForm);
                    model.changeLocalStore(data);
                    model.refreshAfteSort(data);
                    controller.search();
                }else{
                	return false;
				}


			});
            $('.name-inForm').keyup(function () {
                this.value = this.value.replace(/[^а-яё]/ig, '');
            });
        },
		addChengeContent: function (data) {
            $('#modal_form').append(`
				<div class="content" id="ch_${data.id}">
					<input type="text" name="lastName" class="name-inForm" id="lastName" placeholder="Фамилия" maxlength="15" value="${data.lastName}">
					<input type="text" name="firstName" class="name-inForm" id="firstName" placeholder="Имя" value="${data.firstName}" maxlength="15">
					<input type="text" name="surname" class="name-inForm" id="surname" placeholder="Отчество" value="${data.surname}" maxlength="15">
					<input id="datepicker" readonly="true" name="datePerson" value="${data.datePerson}">
					<select id="deportment_select" name="deportment">
						<option value="Офис">Офис</option>
						<option value="Склад">Склад</option>
						<option value="Охрана">Охрана</option>
					</select>
					<select id="position_select" name="position">
						<option>Руководитель</option>
						<option>Менеджер</option>
					</select>
					<input type="text" id="phone_mask" name="phone_number" placeholder="Номер телефона" value="${data.phone_number.slice(1)}">
					<select id="status" name="status">
						<option value="true">Работает</option>
						<option value="false">Уволен</option>
					</select>
					<button id="changePerson">Изменить сотрудника</button>
				</div>
			`);
            $('.name-inForm').keyup(function () {
                this.value = this.value.replace(/[^а-яё]/ig, '');
            });
        },
		addDeprtmentContent: function (data) {
			$('#modal_form').append(`
				<div class="content" id="sh_${data.id}">
					<select id="deportment_select" name="deportment">
						<option value="Офис">Офис</option>
						<option value="Склад">Склад</option>
						<option value="Охрана">Охрана</option>
					</select>
					<select id="position_select" name="position">
						<option>Руководитель</option>
						<option>Менеджер</option>
					</select>
					<button id="shift_person" class="${data.id}">Изменить сотрудника</button>
				</div>
			`);

        },
		createForm: function (cb) {
			model.funcModelForm(function () {

				cb;

                $('#deportment_select').on('click',function () {
                    controller.validateSelect()
                });

                $('#phone_mask').mask('+7-(000)-(000)-00-00');

                $('#datepicker').datepicker({  // настройка и вызов плагина datePiker
                    dateFormat: 'dd.mm.yy',
                    minYear: 1992,
                    yearRange:'1922:2017',
                    changeMonth:true,
                    changeYear:true,
                });
            });
        },


	};
	/************************************************Controller END**********************************************/
    view = (function () {
        controller.addTableElements();
        controller.changeStatusPerson();
        controller.search();
    }());
});
