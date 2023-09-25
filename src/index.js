import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState, useEffect } from 'react';
import axios from 'axios'

const App = ()=> {
  const [owners, setOwners] = useState([])
  const [pets, setPets] = useState([])

  useEffect(()=>{
    const fetchOwners = async()=>{
      const response = await axios.get('/api/owners')
      setOwners(response.data)
    }
    const fetchPets = async()=>{
      const response = await axios.get('/api/pets')
      setPets(response.data)
    }
    fetchOwners()
    fetchPets()
  }, [])

  async function addOwner(pet, owner){
    pet = {...pet, owner_id: owner.id}
    const response = await axios.put(`api/pets/${pet.id}`, pet)
    setPets(pets.map(pet=>pet.id === response.data.id ? response.data : pet))
  }
  async function removeOwner(pet){
    pet = {...pet, owner_id: null}
    const response = await axios.put(`api/pets/${pet.id}`, pet)
    setPets(pets.map(pet=>pet.id === response.data.id ? response.data : pet))
  }

  return (<>
    <h1> AC PET CLUB </h1>
    <div className='main'>
      <div>
        <h2>Owners</h2>
        <ul>
          {
          owners.map(owner=>{
            const myPets = pets.filter(pet=>pet.owner_id === owner.id)
            return (
              <li key={owner.id}>
                {owner.name} ({ myPets.length })
              </li>
            )
          })
          }
        </ul>
      </div>
      <div>
        <h2>Pets</h2>
        <ul>
          {
          pets.map(pet=>{
            return (
              <li key={pet.id}>
                {pet.name}
                <ul>
                {
                  owners.map(owner=>{
                    return (
                      <li key={owner.id}>
                        { owner.name }
                        {
                          pet.owner_id === owner.id ? <button onClick={()=>removeOwner(pet)}>Remove</button> : <button onClick={()=>addOwner(pet, owner)}>Add</button>
                        }
                      </li>
                    )
                  })
                }
                </ul>
              </li>
            )
          })
          }
        </ul>
      </div>
    </div>

  </>);
};

const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(<App />);
