

function App() {
 return (
    <Routes>
       <Route path="/" element={<Layout />}></Route>
      <Route path="login" element={<Login />} />
    </Routes>
  )
}

export default App
