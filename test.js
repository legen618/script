const defaultParams = {
	shop_handle: "shopflex",
	merchant_id: "2000818970",
    product_id: "16053794067830550272032921",
	variant_id: "18054401587617582131762921"
}

const defaultResources = [{
    id: 0,
    name: "虚拟资源1"
}, {
    id: 1,
    name: "虚拟资源2"
}]

const defaultPlans = [{
    id: 0,
    startDate: "2022-06-11",
    startTime: "8:00",
    endTime: "10:00",
    capacity: 10
},{
    id: 1,
    startDate: "2022-06-12",
    startTime: "8:30",
    endTime: "11:00",
    capacity: 10
}]

let resources = [];
let dateplans = [];
let product_id = "";
let variant_id = "";

let embeddedElement;

Date.prototype.format = function(fmt) { 
	var o = { 
	   "M+" : this.getMonth()+1,                 //月份 
	   "d+" : this.getDate(),                    //日 
	   "h+" : this.getHours(),                   //小时 
	   "m+" : this.getMinutes(),                 //分 
	   "s+" : this.getSeconds(),                 //秒 
	   "q+" : Math.floor((this.getMonth()+3)/3), //季度 
	   "S"  : this.getMilliseconds()             //毫秒 
   }; 
   if(/(y+)/.test(fmt)) {
		   fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
   }
	for(var k in o) {
	   if(new RegExp("("+ k +")").test(fmt)){
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
		}
	}
   return fmt; 
  }

// 启动函数
;(function() {
    // 检测商品详情页
	if (Shopline.uri.alias !== 'ProductsDetail') {
        return;
    }
    loadStyle("https://legen618.github.io/script/test.css");
	embeddedElement = document.createElement("div");
    embeddedElement.className = "floating";
    //把div元素节点添加到body元素节点中成为其子节点，但是放在body的现有子节点的最后
    document.querySelector("body").appendChild(embeddedElement);
    
    // 监听选择的sku的变化
    Shopline.event.on('Product::SkuChanged', (data) => {
		product_id = data.data.productId;
		variant_id = data.data.skuSeq;

        // 当init的时候加载商品可选资源
		if (data.data.type === 'init') {
			getResourceList(Shopline.handle, product_id);
		}

        // 根据productId和variantId去获取对应的排期
        // data.data.productId, data.data.skuSeq
		getDatePlanList(Shopline.handle, product_id, variant_id);
    });
})()

function generateOpenButtonHtml() {
	return `<button class="open-close-btn" onclick="handleTableOpenClose()"></button>`;
}

function generateTableInnerHtml() {
	if (dateplans == undefined || dateplans.length == 0) {
		return "";
	}

	var tableBody = "<tbody>";
	for(let i = 0; i < dateplans.length; i++) {
		let plan = dateplans[i];
		tableBody += 
		'<tr>' +
			'<td>' + new Date(plan.startDate).format('yyyy-MM-dd') + '</td>' +
			'<td>' + new Date(plan.startTime).format('hh:mm:ss') + '</td>' +
			'<td>' + new Date(plan.endTime).format('hh:mm:ss') + '</td>' +
			'<td>' + plan.capacity + '</td>' +
			'<td><input class="capacity-input" value="0"></td>' +
			'<td>' + generateTableSelectHtml() +
		'</tr>';
	}
	tableBody += "</tbody>";

	return `
	<div class="reserve-table-container" style="visibility: visible;">
		<table class="reserve-plan-table" cellspacing="0" border>
			<thead>
				<tr>
					<th>Date</th>
					<th>StartTime</th>
					<th>EndTime</th>
					<th>Capacity</th>
					<th>Quantity</th>
					<th>Resource</th>
				</tr>
			</thead>
		` + tableBody + 
		`<tfoot><tr><td colspan="6">` + 
			`<button class="confirm-btn" onclick="handleConfirm()">Confirm</button>` + 
		`</td></tr></tfoot>` + 
		`</table>` + 
	`</div>`;
	
}

function generateTableSelectHtml() {
	var tableSelect = `<select class="select-quantity" id=""><option value="">请选择</option>`;
	for (let j = 0; j < resources.length; j++) {
		let resource = resources[j];
		tableSelect += `<option value="` + resource.id + `">`+ resource.name + `</option>`;
	}
	tableSelect += '</select>';
	return tableSelect;
}

function loadStyle(url){
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
}

function handleConfirm() {
	let data = {
		product_id: product_id,
		variant_id: variant_id,
		plan_id_list: [],
		quantity_list: [],
		resource_id_list: []
	};
	let inputNodeList = document.querySelectorAll("input.capacity-input");
	let selectNodeList = document.querySelectorAll("select.select-quantity");
	inputNodeList.forEach(input => {
		if (!isNaN(input.value)) {
			data.quantity_list.push(Number(input.value));
		}
		else {
			data.quantity_list.push(0);
		}
	})
	selectNodeList.forEach(select => {
		data.resource_id_list.push(select.value);
	})
	dateplans.forEach(plan => {
		data.plan_id_list.push(plan.id);
	})

	console.log(data);
	fetch('http://localhost:7004/reserve/order/create/' + Shopline.handle, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: data
	})
	.then(res => {
		if (res.status == 200) {
			alert('commit order success!');
			getDatePlanList();
		}
		else {
			alert('fail in commit order');
		}
	})
	.catch(e => {
		alert('fail in commit order');
	})
}

function handleTableOpenClose() {
	let tableContainer = document.querySelector(".reserve-table-container");
	tableContainer.style.visibility = tableContainer.style.visibility == 'hidden' ? 'visible' : 'hidden'; 
}

function getResourceList(handle, productId) {
	fetch('http://localhost:7004/reserve/resources/' + handle + '/' +
			productId, {
		method: 'GET'
	})
	.then(async response => {
		let json = await response.json();
		if (json != undefined && json != null) {
			resources = [...json.data];
		}
	})
	.catch(e => {
		resources = [];
	})
}

function getDatePlanList(handle, productId, variantId) {
	fetch('http://localhost:7004/reserve/dateplans/'+ handle + '/' +
			productId + '/' + 
			variantId, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	})
	.then(async response => {
		let json = await response.json();
		if (json != undefined && json != null) {
			dateplans = [...json.data];
			embeddedElement.innerHTML = "";
			embeddedElement.innerHTML += generateTableInnerHtml();
			// embeddedElement.innerHTML += generateOpenButtonHtml();  取消掉开合按钮，直接展示
		}
	})
	.catch(e => {
		dateplans = [];
	})
	// dateplans = [...defaultPlans];
}
