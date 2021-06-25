(function() {
var StockText = {
  InStock: 'In Stock',
  NotInStock: 'Not In Stock'
}
  
function sortDates(metafield1, metafield2) {
    var date1 = metafield1.purchase_order.expected_arrival;
    var date2 = metafield2.purchase_order.expected_arrival;
    date1 = new Date(date1);
    date2 = new Date(date2);
    if (date1 < date2) return -1;
    if (date1 > date2) return 1;
    return 0;
}

function formatDate(date) {
    var day = String(date.getDate());
    var month = String(date.getMonth() + 1);
    var year = String(date.getFullYear() % 100);
    return month + '/' + day + '/' + year;
}
  
function classForStockText(text) {
  switch(text) {
    case StockText.InStock:
      return 'fs-in-stock'
    case StockText.NotInStock:
      return ''
    default:
      return 'fs-expected-arrival'
  }
}
    
function stockText(fullShelfItems, inventoryQuantity, lineItemQuantity, productTags) {
    fullShelfItems = Object.values(fullShelfItems);
    var isDropship = productTags.indexOf('Dropship') !== -1;
    var isCustomMasBra = productTags.indexOf('Customized Mastectomy Bras') !== -1;
    var isGiftCard =  productTags.indexOf('Gift cards') !== -1;
    if (isDropship || isCustomMasBra || isGiftCard || lineItemQuantity <= inventoryQuantity) {
      return StockText.InStock;
    }
   
    if (fullShelfItems.length) {
      fullShelfItems.sort(sortDates);
      var fsItem;
      var open = 0;
      for (var i = 0; i < fullShelfItems.length; i++) {
        var currentItem = fullShelfItems[i];
        open = open + (currentItem.quantity - currentItem.quantity_received);
        if ((open + inventoryQuantity) >= lineItemQuantity) {
          fsItem = currentItem;
          break;
        }
      }
      
      if (fsItem) {
       var expectedArrival = new Date(fsItem.purchase_order.expected_arrival);
       return 'Estimated Shipping Date ' + formatDate(expectedArrival);
      }
    }
    
    return StockText.NotInStock;
}

if ($) {
  $(function() {
    $('.full-shelf-stock-indicator').each(function() {
      var indicator = $(this);
      var fullShelfItems = indicator.data('full-shelf-items');
      var inventoryQuantity = indicator.data('inventory-quantity');
      var lineItemQuantity = indicator.data('line-item-quantity');
      var productTags = indicator.data('product-tags');
      var text = stockText(fullShelfItems, inventoryQuantity, lineItemQuantity, productTags);
      indicator.text(text);
      indicator.addClass(classForStockText(text));
      })
	})
  } else if (Shopify.Checkout) {
    (function($) {
      $(document).on("page:load page:change", function() {
        $('.fs-stock-indicator').remove();
    	$('.product__description__variant').each(function(index, element) {
          var element = $(this);
          var lineItem = fullShelfLineItems[index];
          var text = stockText(lineItem.fullShelfItems, lineItem.inventoryQuantity, lineItem.quantity, lineItem.tags);
          var indicator = $('<span class="fs-stock-indicator">' + text + '</span>');
          indicator.addClass(classForStockText(text));
          element.after(indicator);                      
        })
      });
   	})(Checkout.$);
  }
})()




