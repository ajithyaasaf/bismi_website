import Link from 'next/link';
import { SHOP_CONFIG } from '@/lib/config';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{SHOP_CONFIG.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{SHOP_CONFIG.tagline}</p>
                        <p className="text-sm text-gray-400">
                            {SHOP_CONFIG.workingDays}<br />
                            {SHOP_CONFIG.workingHours}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm hover:text-white transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/menu" className="text-sm hover:text-white transition-colors">Menu</Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-sm hover:text-white transition-colors">Cart</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Contact Us</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400 shrink-0">
                                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
                                </svg>
                                <a href={`tel:${SHOP_CONFIG.phone}`} className="hover:text-white transition-colors">
                                    {SHOP_CONFIG.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400 shrink-0">
                                    <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.274 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                                </svg>
                                <a href={SHOP_CONFIG.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    {SHOP_CONFIG.address}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-400 shrink-0">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm-3.11 5.89c.21-.468.427-.477.625-.486h.213c.198 0 .52.074.792.372.273.297 1.04 1.016 1.04 2.479s-1.065 2.876-1.213 3.074c-.149.198-2.054 3.283-5.077 4.487-.709.306-1.262.489-1.694.626-.712.226-1.36.194-1.871.118-.571-.085-1.758-.72-2.006-1.414-.248-.694-.248-1.289-.174-1.413.075-.124.273-.198.57-.347.298-.149 1.758-.867 2.031-.967.272-.099.47-.148.67.15.197.297.766.966.94 1.164.172.198.346.223.643.074.297-.149 1.255-.462 2.39-1.475.883-.788 1.48-1.761 1.653-2.059.174-.297.019-.458-.13-.606Z" clipRule="evenodd" />
                                </svg>
                                <a
                                    href={`https://wa.me/${SHOP_CONFIG.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    WhatsApp Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} {SHOP_CONFIG.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
