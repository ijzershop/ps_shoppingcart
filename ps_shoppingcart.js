/* global $, prestashop */
/**
 * This module exposes an extension point in the form of the `showModal` function.
 *
 * If you want to override the way the modal window is displayed, simply define:
 *
 * prestashop.blockcart = prestashop.blockcart || {};
 * prestashop.blockcart.showModal = function myOwnShowModal (modalHTML) {
 *   // your own code
 *   // please not that it is your responsibility to handle closing the modal too
 * };
 *
 * Attention: your "override" JS needs to be included **before** this file.
 * The safest way to do so is to place your "override" inside the theme's main JS file.
 *
 */
$(document).ready(function() {
  /**
   * Carrier switch in shopping cart
   */
  $(document).on('click', '.carrier-selection[name="carrier_selection_bottom_cart"],' +
    '.carrier-selection[name="carrier_selection_top"],' +
    '.carrier-selection[name="carrier_selection_checkout_cart"]', function(e){
    var val = $(this).val();
    $('.carrier-selection[name="carrier_selection_top"][value="'+val+'"]').prop('checked', true);
    $('.carrier-selection[name="carrier_selection_bottom_cart"][value="'+val+'"]').prop('checked', true);
    $('.carrier-selection[name="carrier_selection_checkout_cart"][value="'+val+'"]').prop('checked', true);

    const link = '/index.php?fc=module&module=ps_shoppingcart&controller=ajax&action=set_carrier&checked='+val+'&ajax=1'+'&token='+prestashop.token;
    $.ajax({
      url: link,
      type: 'POST',
      success(json) {
        const response = JSON.parse(json);
        $('#shoppingcart-side-panel').html(response.modal);
        $('.shoppingcart-header-box .js-cart').replaceWith(response.preview);

        if($('.cart-overview.js-cart').length > 0){
          $('.shipping-total .value.price').text(response.total_shipping);
          $('.summary-total-tax .value.sub').text(response.total_tax);
          $('.cart-summary-totals .cart-total .value').text(response.total_with_taxes);
        }

        if($('#js-checkout-summary').length > 0){
          $('.shipping-total .value.price').text(response.total_shipping);
          $('.summary-total-tax .value.sub').text(response.total_tax);
          $('.cart-summary-totals .cart-total .value').text(response.total_with_taxes);
          if(val === 'shipping'){
            $('.custom-radio #delivery_option_'+shoppingcart.shipping_carrier).prop('checked', true);
          } else {
            $('.custom-radio #delivery_option_'+shoppingcart.pickup_carrier).prop('checked', true);
          }
        }
      },
    }).error(function(e){
      prestashop.emit('handleError', {
        eventType: 'updateCart',
        e,
      });
    });
  });


  /**
   * Toggle of side menu prices list
   *
   */
  $(document).on('change', '.cart_details_toggle', function(e){
    var value = $(this).prop('checked');

    const link = '/index.php?fc=module&module=ps_shoppingcart&controller=ajax&action=toggle_cart&checked='+value+'&ajax=1'+'&token='+prestashop.token;
    $.ajax({
      url: link,
      type: 'POST',
      success(json) {

      }
    }).error(function(e){
      prestashop.emit('handleError', {
        eventType: 'updateCart',
        e,
      });
    });

  })



});







