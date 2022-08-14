const Smorgasbord = (props: any) => {
  return (
    <ul>
      {
        props.flavours && props.flavours.length > 0 && props.flavours.map((flavour: any) => <li>{flavour.name}</li>)
      }
    </ul>
  )
}

export default Smorgasbord;