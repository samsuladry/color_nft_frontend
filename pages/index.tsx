import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import Web3 from 'web3'
import Color, {abi, networks} from '../../smart_contract/build/contracts/Color.json'
import styles from '../styles/Home.module.css'

declare global {
  interface Window {
      ethereum:any;
      web3: any;
  }
}

const Home: NextPage = () => {

  const [account, setAccount] = useState("")
  const [contract, setContract]: any = useState(null)
  const [totalSupply, setTotalSupply] = useState(0)
  const [colors, setColors] = useState([])
  const [color, setColor] = useState("")

 const loadWeb3 = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  }
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  }
  else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
 }

 const loadBlockchainData = async () => {
  const web3 = window.web3
  // Load account
  const accounts = await web3.eth.getAccounts()
  setAccount(accounts)

  // const networkId = await web3.eth.net.getId()
  let networkId = Object.keys(networks)[0] as keyof typeof networks; // 5777
  const networkData: any = Color.networks[networkId]
  
  if(networkData) {
    // console.log("network: ", accounts)
    const abi = Color.abi
    const address = networkData.address
    const contract = new web3.eth.Contract(abi, address)
    setContract(contract)

    const totalSupply = await contract.methods.balanceOf(accounts[0]).call()
    setTotalSupply(totalSupply)

    // Load Colors
    const newObject: any = [...colors];
    for (var i = 1; i <= totalSupply; i++) {
      const color = await contract.methods.colors(i - 1).call()
      // this.setState({
      //   colors: [...this.state.colors, color]
      // })
      newObject.push(color)
    }

    setColors(newObject)
  } else {
    window.alert('Smart contract not deployed to detected network.')
  }
}

 useEffect(() => {
  loadWeb3()
  loadBlockchainData()
}, [])

  const onSubmit = (e: any) =>
  {
    e.preventDefault()
    mint(color)
  }

  // const mint = (color) => {
  //   this.state.contract.methods.mint(color).send({ from: this.state.account })
  //   .once('receipt', (receipt) => {
  //     this.setState({
  //       colors: [...this.state.colors, color]
  //     })
  //   })
  // }

  const mint = async (color: string) => {

    try {
      if(contract !== null)
      {
        await contract.methods.mint(color).send({ from: account[0] })
        .once('receipt', (res: any) => {

          // console.log("receipt: ", res)
          const newObject: any = [...colors];
          newObject.push(color)
          setColors(newObject)
        })
      }
      
    } catch (error) {
      console.error("Error: ", error)
    }
  }

  return (
    <div className={styles.container}>

      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="https://www.youtube.com/watch?v=YPbgjPPC1d0&t=135s"
          target="_blank"
          rel="noopener noreferrer"
          style={{ paddingLeft: 30 }}
        >
          Color Tokens 
        </a>

        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-block">
            <small className="text-white"><span id="account">{account}</span></small>
          </li>
        </ul>
      </nav>

      <div className="container-fluid mt-5">
        
        <div className="row">
          <main role="main" className="col-lg-12 text-center">
            <div className="content mr-auto ml-auto">
              <h1>Issue Token</h1>
              <form onSubmit={onSubmit}>

                <input
                  type='text'
                  className='form-control mb-2'
                  placeholder='e.g. #FFFFFF'
                  name='color'
                  value={color}
                  onChange={(e) => {setColor(e.target.value)}}
                  // ref={(input) => { color = input }}
                />

                <input
                  type='submit'
                  className='btn btn-block btn-primary'
                  value='MINT'
                />

              </form>

            </div>
          </main>
        </div>

        <hr/>
        
        <div className="row text-center">
          { colors.map((color, key) => {
            return(
              <div key={key} className="col-md-3 mb-3">
                <div className="token" style={{ backgroundColor: color }}></div>
                <div>{color}</div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default Home
