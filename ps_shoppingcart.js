/**
 * 2007-2020 PrestaShop and Contributors
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License 3.0 (AFL-3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2020 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */

/**
 * This module exposes an extension point through `showModal` function.
 *
 * If you want to customize the way the modal window is displayed, you need to do:
 *
 * prestashop.blockcart = prestashop.blockcart || {};
 * prestashop.blockcart.showModal = function myOwnShowModal (modalHTML) {
 *   // your own code
 *   // please not that it is your responsibility to handle the modal "close" behavior
 * };
 *
 * Warning: your custom JavaScript needs to be included **before** this file.
 * The safest way to do so is to place your "override" inside the theme main JavaScript file.
 *
 */

// $(document).ready(function () {
//   prestashop.blockcart = prestashop.blockcart || {};
//
//   var showModal = prestashop.blockcart.showModal || function (modal) {
//     var $body = $('body');
//     $body.append(modal);
//     $body.one('click', '#blockcart-modal', function (event) {
//       if (event.target.id === 'blockcart-modal') {
//         $(event.target).remove();
//       }
//     });
//   };
//
//   prestashop.on(
//     'updateCart',
//     function (event) {
//       var refreshURL = $('.blockcart').data('refresh-url');
//       var requestData = {};
//       if (event && event.reason && typeof event.resp !== 'undefined' && !event.resp.hasError) {
//         requestData = {
//           id_customization: event.reason.idCustomization,
//           id_product_attribute: event.reason.idProductAttribute,
//           id_product: event.reason.idProduct,
//           action: event.reason.linkAction
//         };
//       }
//       if (event && event.resp && event.resp.hasError) {
//         prestashop.emit('showErrorNextToAddtoCartButton', { errorMessage: event.resp.errors.join('<br/>')});
//       }
//       $.post(refreshURL, requestData).then(function (resp) {
//         var html = $('<div />').append($.parseHTML(resp.preview));
//         $('.blockcart').replaceWith($(resp.preview).find('.blockcart'));
//         if (resp.modal) {
//           showModal(resp.modal);
//         }
//       }).fail(function (resp) {
//         prestashop.emit('handleError', { eventType: 'updateShoppingCart', resp: resp });
//       });
//     }
//   );
// });


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
