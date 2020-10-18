import { ApiPromise, WsProvider} from '@polkadot/api';
import React from 'react';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: "",
            result: null,
            isLoading: true,
            error: null,
            init: false,
        }

        this.runSearch = this.runSearch.bind(this);
        this.network = 'wss://kusama-rpc.polkadot.io'
    }

    componentDidMount() {
        const provider = new WsProvider(this.network);
        ApiPromise.create({ provider }).then(api => {
            this.api = api;
            this.setState({isLoading: false})
        }).catch(error => {
            console.error(error)
            this.setState({error})
        })
    }


    async runSearch(event) {
        event.preventDefault()
        if(this.state.isLoading) {
            return;
        };

        const {query} = this.state;
        
        this.setState({isLoading: true, init: true });
        const hash = /^[0-9]+$/.test(query) ? await this.api.rpc.chain.getBlockHash(query) : query;
        this.api.rpc.chain.getBlock(hash, (result) => {
            console.log("GOT BLOCK INFO", result)
            this.setState({isLoading: false, search: "", result });
        })
    };

    render() {
        const {query, error, isLoading, result, init} = this.state;

        let text
        if (isLoading) {
            text = "Loading. Please, wait..."; 
        } else if (error) {
            text = error.message || error;
        } else if (!init) {
            text = `Connected to ${this.network}. Use hash or height to get block info`;
        } else if (!result) {
            text = "Nothing found. Try different query"
        } else {
            text = JSON.stringify(result, null, "  ")
        }
        return (
            <div>
                <form>
                    <input placeholder="" style={{width: "500px"}} onChange={(event) => this.setState({ query: event.target.value})} value={query} />
                    {" "}
                    <button disabled={isLoading}  onClick={this.runSearch}>Search</button>
                </form>
                    <hr />
                <pre>
                    {text}
                </pre>
            </div>
            
        )

    }
}
