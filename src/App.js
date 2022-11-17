import { useState, useCallback } from "react"
import { createWorker } from "tesseract.js"
import { StringDiff } from "react-string-diff"
import "./App.css"

function App() {
	const [ocr1, setOcr1] = useState("")
	const [ocr2, setOcr2] = useState("")
	const [imageData1, setImageData1] = useState(null)
	const [imageData2, setImageData2] = useState(null)

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
		async (worker, imageData, setOcr) => {
			if (!imageData) return
			await worker.load()
			await worker.loadLanguage("eng+fra+spa")
			await worker.initialize("eng+fra+spa")
			const {
				data: { text },
			} = await worker.recognize(imageData)
			setOcr(text)
		},
		[]
	)

	const handleImageChange = (worker, setImageData, setOcr) => (e) => {
		const file = e.target.files[0]
		if (!file) return
		const reader = new FileReader()
		reader.onloadend = () => {
			const imageDataUri = reader.result
			setImageData(imageDataUri)

			convertImageToText(worker, imageDataUri, setOcr)
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
		return arr.map((el, i) => (
			<div key={i} className='textLine'>
				{el}
			</div>
		))
	}

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
							setOcr1
						)}
						accept='image/*'
					/>
					<img src={imageData1} alt='' srcset='' />
					{addBreaks(ocr1)}
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
							setOcr2
						)}
						accept='image/*'
					/>
					<img src={imageData2} alt='' srcset='' />
					{addBreaks(ocr2)}
				</div>
			</div>
			<div>
				<StringDiff oldValue={ocr2} newValue={ocr1} />
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
