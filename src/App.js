import { useState, useCallback } from "react"
import { createWorker } from "tesseract.js"
import { StringDiff } from "react-string-diff"
import { Comment } from "react-loader-spinner"
import "./App.css"

function App() {
	const [ocr1, setOcr1] = useState("")
	const [ocr2, setOcr2] = useState("")
	const [imageData1, setImageData1] = useState(null)
	const [imageData2, setImageData2] = useState(null)
	const [isLoading1, setIsLoading1] = useState(false)
	const [isLoading2, setIsLoading2] = useState(false)

	const worker1 = createWorker({
		logger: (m) => {
			console.log(m)
		},
	})

	const worker2 = createWorker({
		logger: (m) => {
			console.log(m)
		},
	})

	const convertImageToText = useCallback(
		async (worker, imageData, setOcr, setIsLoading) => {
			if (!imageData) return
			setIsLoading(true)
			await worker.load()
			await worker.loadLanguage("eng+fra+spa")
			await worker.initialize("eng+fra+spa")
			const {
				data: { text },
			} = await worker.recognize(imageData)
			setIsLoading(false)
			setOcr(text)
		},
		[]
	)

	const handleImageChange = (worker, setImageData, setOcr, setIsLoading) => (e) => {
		const file = e.target.files[0]
		if (!file) return
		const reader = new FileReader()
		reader.onloadend = () => {
			const imageDataUri = reader.result
			setImageData(imageDataUri)

			convertImageToText(worker, imageDataUri, setOcr, setIsLoading)
		}
		reader.readAsDataURL(file)
	}

	const handleClear = () => {
		setImageData1(null)
		setImageData2(null)
		setOcr1("")
		setOcr2("")
	}

	const addBreaks = (str) => {
		const arr = []
		let breakpoint
		for (let i = 0; i < str.length; i++) {
			if (str.slice(i, i+3) === "FR:") console.log(str.slice(i, i+3))

			if (str.slice(i, i + 3) === "ES:") {
				arr.push(str.slice(0, i))
				breakpoint = i
			}
			if (str.slice(i, i + 3) === "FR:") {
				arr.push(str.slice(breakpoint, i))
				arr.push(str.slice(i))
				break
			}
		}

		if (arr.length < 3) return [str]

		return arr
	}

	const arr1 = addBreaks(ocr1)
	const arr2 = addBreaks(ocr2)

	return (
		<div className='App'>
			<div className='diff'>
				<div>
					<h2>Choose an Image</h2>
					<input
						type='file'
						name=''
						id=''
						onChange={handleImageChange(
							worker1,
							setImageData1,
							setOcr1,
							setIsLoading1
						)}
						accept='image/*'
					/>
					<img src={imageData1} alt='' srcset='' />
					{isLoading1 ? <Comment
  visible={true}
  height="80"
  width="80"
  ariaLabel="comment-loading"
  wrapperStyle={{}}
  wrapperClass="comment-wrapper"
  color="#fff"
  backgroundColor="#000066"
/> : null}
					{arr1.map((el, i) => (
			<div key={i} className='textLine'>
				{el}
			</div>
		))}
				</div>
				<div>
					<h2>Choose an Image</h2>
					<input
						type='file'
						name=''
						id=''
						onChange={handleImageChange(
							worker2,
							setImageData2,
							setOcr2,
							setIsLoading2
						)}
						accept='image/*'
					/>
					<img src={imageData2} alt='' srcset='' />
					{isLoading2 ? <Comment
  visible={true}
  height="80"
  width="80"
  ariaLabel="comment-loading"
  wrapperStyle={{}}
  wrapperClass="comment-wrapper"
  color="#fff"
  backgroundColor="#000066"
/> : null}
					{arr2.map((el, i) => (
			<div key={i} className='textLine'>
				{el}
			</div>
		))}
				</div>
			</div>
			<div>
				{
					arr1.map((el, i) => <div className="textLine" key={i}><StringDiff oldValue={arr2[i] ?? ''} newValue={el ?? ''}/></div>) 
				}
			</div>
			{ocr1 || ocr2 ? (
				<div className='button'>
					<button onClick={handleClear}>CLEAR</button>
				</div>
			) : null}
		</div>
	)
}
export default App
