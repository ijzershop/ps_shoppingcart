<?php
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
class Ps_ShoppingcartAjaxModuleFrontController extends ModuleFrontController
{
    /**
     * @var bool
     */
    public $ssl = true;

    /**
     * @see FrontController::initContent()
     *
     * @return void
     */
    public function initContent()
    {
        parent::initContent();

        $modal = null;

        if ($this->module instanceof Ps_Shoppingcart && Tools::getValue('action') === 'add-to-cart') {
            $modal = $this->module->renderModal(
                $this->context->cart,
                (int) Tools::getValue('id_product'),
                (int) Tools::getValue('id_product_attribute'),
                (int) Tools::getValue('id_customization')
            );
        }

        if (Tools::getValue('action') === 'set_carrier') {
            $carrier = Tools::getValue('checked');
            $id_cart = Context::getContext()->cookie->id_cart;
            $cartObject = new Cart($id_cart);
            $delivery_option_list = $cartObject->getDeliveryOptionList($this->context->country);

            $shipping_config = unserialize(Configuration::get('koopmanOrderExport'));
            $shippingCarrier = (int)$shipping_config['select_carrier'];
            $pickupCarrier = (int)$shipping_config['select_pickup_carrier'];
            try {
                switch ($carrier) {
                    case 'shipping':
                        $this->context->cart->id_carrier = $shippingCarrier;
                        foreach ($delivery_option_list as $id_address => $delivery_option) {
                            foreach ($delivery_option as $delivery_option_key => $option) {
                                if ((int)$delivery_option_key == $shippingCarrier) {
                                    $delivery_option_value = [$id_address => $delivery_option_key];
                                    $this->context->cart->setDeliveryOption($delivery_option_value);
                                    $this->context->cart->save();
                                }
                            }
                        }
                        break;
                    case 'pickup':
                        $this->context->cart->id_carrier = $pickupCarrier;
                        foreach ($delivery_option_list as $id_address => $delivery_option) {
                            foreach ($delivery_option as $delivery_option_key => $option) {
                                if ((int)$delivery_option_key == $pickupCarrier) {
                                    $delivery_option_value = [$id_address => $delivery_option_key];
                                    $this->context->cart->setDeliveryOption($delivery_option_value);
                                    $this->context->cart->save();
                                }
                            }
                        }
                        break;
                }
            } catch (PrestaShopException $e) {
                die(json_encode([
                    'success' => false,
                    'error' => $e->getMessage(),
                    'modal' => $this->module->renderList($this->context->cart),
                    'preview' => $this->module->renderWidget(null, ['cart' => $this->context->cart]),
                ]));
            }

            
            die(json_encode([
                'cart' => $this->context->cart,
                'total_shipping' => Context::getContext()->currentLocale->formatPrice((float)Context::getContext()->cart->getOrderTotal(false, Cart::ONLY_SHIPPING), 'EUR'),
                'total_tax' => Context::getContext()->currentLocale->formatPrice((float)Context::getContext()->cart->getOrderTotal(true)-(float)Context::getContext()->cart->getOrderTotal(false), 'EUR'),
                'total_with_taxes' => Context::getContext()->currentLocale->formatPrice((float)Context::getContext()->cart->getOrderTotal(true), 'EUR'),
                'success' => true,
                'error' => null,
                'modal' => $this->module->renderList($this->context->cart),
                'preview' => $this->module->renderWidget(null, ['cart' => $this->context->cart]),
            ]));
        }

        if(Tools::getValue('action') === 'toggle_cart'){
            $checked = Tools::getValue('checked');
            $this->context->cookie->__set('cart_toggle', $checked);
            die(json_encode(['cart_toggle'=>$checked]));
        }

        $modal = $this->module->renderList($this->context->cart);

        ob_end_clean();
        header('Content-Type: application/json');
        die(json_encode([
            'preview' => $this->module instanceof Ps_Shoppingcart ? $this->module->renderWidget(null, ['cart' => $this->context->cart]) : '',
            'modal' => $modal,
        ]));
    }
}
