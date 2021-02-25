import React,  { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: '',
        outputValues: ''
    };

    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
        this.setState({ outputValues: this.renderValues()});
        
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({ values: values.data});
    }

    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');
        this.setState({
            seenIndexes: seenIndexes.data
        })
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        await axios.post('/api/values',{
            index: this.state.index
        });
        this.setState({index:'' });
        this.fetchValues();
        this.setState({ outputValues: this.renderValues()});
    };

    handleClear = async (event) => {
        event.preventDefault();
        await axios.post('/api/values/clear',{
          
        });
       
    };

    renderSeenIndexes() {
        return this.state.seenIndexes.map(({ number }) => number).join(', ');
    };

    renderValues () {
        const entries =[];

        for (let key in this.state.values) {
            entries.push(               
                   'For index'+ key+ 'i calculated'+ this.state.values[key]+'\r\n'
            );
        }
        
        return entries.toString();
    };


    render ()  {
        return (
            <div>
                <form onSubmit ={this.handleSubmit}>
                    <label>Enter your Index:</label>
                    <input 
                      value={this.state.index}
                      onChange ={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>
                <br/>

                <form onSubmit ={this.handleClear}>
                    <label>löschen Berechnete Werte:</label>
                    
                    <button>Clear </button>
                </form>

                <h3>Index I have seen:</h3>
                {this.renderSeenIndexes()}
                <h3>Calculated Values:</h3>
                <textarea type="textarea" value={this.state.outputValues}
                    rows='5'
                    cols='40'
                />
                
            </div>
        )
    }
}

export default Fib;