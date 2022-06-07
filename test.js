const defaultParams = {
	merchant_id: "2000818970",
    product_id: "16053794067830550272032921",
	variant_id: "18054401587617582131762921"
}

;(function() {
    // 检测商品详情页
    loadStyle("https://legen618.github.io/script/test.css");

    // 监听选择的sku的变化
//    Shopline.event.on('Product::SkuChanged', (data) => {
//        console.log(data);
//
//        // 根据productId和variantId去获取对应的排期
//        // data.data.productId, data.data.skuSeq
//
//		// 根据productId获取可用资源
//
//		// 渲染一个悬浮窗
//
//    });
    let div = document.createElement("div");
    console.log(div);
    div.innerText = "helloworld";
    div.className = "floating";
    //把div元素节点添加到body元素节点中成为其子节点，但是放在body的现有子节点的最后
    console.log(document);
    $("body").appendChild(div);
    
})()

function loadStyle(url){
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
}

function getDatePlanList(productId, variantId) {
    return new Promise(resolve => {
        fetch('http://localhost:7004/reserve/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
		  params: defaultParams
        //   params: {
		// 	  merchant_id: Shopline.merchantId,
        //       product_id: productId,
		// 	  variant_id: variantId
        //   }
        })
        .then(async response => {
          resolve((await response.json())?.data || [])
        })
    })
}

