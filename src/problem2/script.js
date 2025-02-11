// 创建图标组件
const Icon = ({ name, size = '1em', className = '' }) => (
    <i className={`fas fa-${name} ${className}`} style={{ fontSize: size }}></i>
);

// main component
function CurrencySwap() {
    const [prices, setPrices] = React.useState({});
    const [tokens, setTokens] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [fromToken, setFromToken] = React.useState({ symbol: 'ETH', amount: '' });
    const [toToken, setToToken] = React.useState({ symbol: 'SWTH', amount: '' });
    const [showTokenList, setShowTokenList] = React.useState(false);
    const [activeField, setActiveField] = React.useState(null);

    React.useEffect(() => {
        const fetchPrices = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://interview.switcheo.com/prices.json');
                const data = await response.json();

                const priceMap = {};
                const tokenSet = new Set();

                data.forEach(item => {
                    // Update prices
                    if (priceMap[item.currency]) {
                        if (new Date(item.date) > new Date(priceMap[item.currency].date)) {
                            priceMap[item.currency] = {
                                price: item.price,
                                date: item.date
                            };
                        }
                    } else {
                        priceMap[item.currency] = {
                            price: item.price,
                            date: item.date
                        };
                    }
                    tokenSet.add(item.currency);
                });

                // Convert price map to final format
                const finalPrices = Object.entries(priceMap).reduce((acc, [currency, data]) => {
                    acc[currency] = data.price;
                    return acc;
                }, {});

                // Convert token set to array of token objects
                const tokenList = Array.from(tokenSet).map(symbol => ({
                    symbol,
                    name: symbol
                }));
                setPrices(finalPrices);
                setTokens(tokenList);

                // Set initial tokens if not set
                if (!fromToken.symbol) {
                    setFromToken(prev => ({ ...prev, symbol: tokenList[0]?.symbol || '' }));
                }
                if (!toToken.symbol) {
                    setToToken(prev => ({ ...prev, symbol: tokenList[1]?.symbol || '' }));
                }
                setLoading(false)
            } catch (err) {
                setError('Failed to fetch prices. Please try again later.');
                setLoading(false);
            }
        };

        fetchPrices();
    }, []);

    const calculateExchangeRate = () => {
        if (!prices[fromToken.symbol] || !prices[toToken.symbol]) return '0';
        const fromPrice = prices[fromToken.symbol];
        const toPrice = prices[toToken.symbol];
        const rate = fromPrice / toPrice;
        return rate.toFixed(6);
    };

    const calculateExchangeAmount = (amount, isFromToken) => {
        if (!amount || !prices[fromToken.symbol] || !prices[toToken.symbol]) return '0';
        const fromPrice = prices[fromToken.symbol];
        const toPrice = prices[toToken.symbol];
        
        if (isFromToken) {
            return ((amount * fromPrice) / toPrice).toFixed(6);
        } else {
            return ((amount * toPrice) / fromPrice).toFixed(6);
        }
    };
    

    const handleSwap = () => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
    };

    const handleAmountChange = (value, field) => {
        if (field === 'from') {
            setFromToken({ ...fromToken, amount: value });
            if (prices[fromToken.symbol] && prices[toToken.symbol]) {
                const newToAmount = calculateExchangeAmount(value, true);
                setToToken({ ...toToken, amount: newToAmount });
            }
        } else {
            setToToken({ ...toToken, amount: value });
            if (prices[fromToken.symbol] && prices[toToken.symbol]) {
                const newFromAmount = calculateExchangeAmount(value, false);
                setFromToken({ ...fromToken, amount: newFromAmount });
            }
        }
    };

    const handleTokenSelect = (token) => {
        if (activeField === 'from') {
            setFromToken({ ...fromToken, symbol: token.symbol });
        } else {
            setToToken({ ...toToken, symbol: token.symbol });
        }
        setShowTokenList(false);
    };

    const TokenSelector = ({ token, field }) => (
        <button
            className="token-selector"
            onClick={() => {
                setShowTokenList(true);
                setActiveField(field);
            }}
        >
            <img 
                src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.symbol}.svg`}
                alt={token.symbol}
                width="24"
                height="24"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect width='24' height='24' fill='%23ccc'/%3E%3C/svg%3E";
                }}
            />
            <span>{token.symbol}</span>
            <Icon name="chevron-down" size="16px" />
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="swap-card">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Swap</h2>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* From Token Input */}
                <div className="token-input-container">
                    <div className="flex justify-between items-center">
                        <input
                            type="number"
                            className="token-input"
                            value={fromToken.amount}
                            onChange={(e) => handleAmountChange(e.target.value, 'from')}
                            placeholder="0.0"
                        />
                        <TokenSelector token={fromToken} field="from" />
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        ≈ ${fromToken.amount && prices[fromToken.symbol] 
                            ? (fromToken.amount * prices[fromToken.symbol]).toFixed(2) 
                            : '0.00'}
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-2">
                    <button
                        onClick={handleSwap}
                        className="p-2 rounded-lg bg-white border shadow hover:shadow-md"
                    >
                        <Icon name="up-down" size="20px" />
                    </button>
                </div>

                {/* To Token Input */}
                <div className="token-input-container">
                    <div className="flex justify-between items-center">
                        <input
                            type="number"
                            className="token-input"
                            value={toToken.amount}
                            onChange={(e) => handleAmountChange(e.target.value, 'to')}
                            placeholder="0.0"
                        />
                        <TokenSelector token={toToken} field="to" />
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        ≈ ${toToken.amount && prices[toToken.symbol] 
                            ? (toToken.amount * prices[toToken.symbol]).toFixed(2) 
                            : '0.00'}
                    </div>
                </div>

                {/* Exchange Rate */}
                <div className="text-sm text-gray-600 my-4 px-2">
                    1 {fromToken.symbol} = {calculateExchangeRate()} {toToken.symbol}
                </div>

                {/* Swap Button */}
                <button
                    onClick={() => alert('Swap executed! (This is a mock implementation)')}
                    disabled={!fromToken.amount || loading}
                    className="swap-button"
                >
                    {loading ? 'Loading...' : 'Swap'}
                </button>

                {/* Token Selection Modal */}
                {showTokenList && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Select Token</h3>
                                    <button 
                                        onClick={() => setShowTokenList(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            
                            {/* add scroll container */}
                            <div className="overflow-y-auto" style={{ maxHeight: '60vh', minHeight: '200px' }}>
                                <div className="p-2">
                                    {tokens.map((token) => (
                                        <button
                                            key={token.symbol}
                                            onClick={() => handleTokenSelect(token)}
                                            className="w-full p-3 hover:bg-gray-50 flex items-center rounded-lg transition-colors duration-200"
                                        >
                                            <img 
                                                src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.symbol}.svg`}
                                                alt={token.symbol}
                                                width="32"
                                                height="32"
                                                className="rounded-full"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23ccc'/%3E%3C/svg%3E";
                                                }}
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="font-medium">{token.symbol}</div>
                                            </div>
                                            <div className="text-right text-gray-600">
                                                <div>${prices[token.symbol]?.toFixed(2) || '—'}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 渲染应用
ReactDOM.render(<CurrencySwap />, document.getElementById('root'));