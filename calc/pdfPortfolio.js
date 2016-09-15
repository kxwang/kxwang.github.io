var eisrcPdfParameters = {
	'retirementportfolio.org': {
		logo: 'rp_org_logo',
		copyrightOwner: 'EISRC and RetirementPortfolio.org',
		contactUrl: '/contact',
		orgNameInPdfFooter: 'EISRC and RetirementPortfolio.org are'
	},
	'eisrc.com': {
		logo: 'eisrc_logo',
		copyrightOwner: 'EISRC',
		contactUrl: '/contact',
		orgNameInPdfFooter: 'EISRC is'
	}
}


// safe default
var pdfParameterToPrint = eisrcPdfParameters['retirementportfolio.org'];
if(/eisrc.com$/.test(document.location.hostname)) {
	pdfParameterToPrint = eisrcPdfParameters['eisrc.com'];
}

function fundTableToPdf(currentDataArray) {
	dd.content[0].columns = [
			{
				image: pdfParameterToPrint.logo
			},
			{
				text: 'Model Portfolio',
				style: 'title'
			},
			{
				text: ''
			}
		];

	dd.content[1].table.body[1][1] = ageRange;
	dd.content[2].table.body[1][1] = buildStockBondAllocationsText(currentDataArray);
	
	var fundTableBodyIndex = 1; // Keep the first element which is the table header. Update the rest
	var fundTableBodyArray = dd.content[3].table.body = dd.content[3].table.body.slice(0, fundTableBodyIndex);

	var assetTypeCount = labelset.length;
	var averageExpenseRatio = 0;
	var selectedFundFamilyArray = fundFamilies[userInputVM.selectedFundFamily()];
	for(var iAsset=0; iAsset<assetTypeCount; iAsset++) {
		if(currentDataArray[iAsset] > 0) {
			fundTableBodyArray[fundTableBodyIndex] = [
				{ text: currentDataArray[iAsset] + '%', alignment: 'center' },
				labelset[iAsset],
				selectedFundFamilyArray[iAsset].name,
				{ 
					text:(selectedFundFamilyArray[iAsset].expenseRatio === 'N/A') ? 'N/A' : (selectedFundFamilyArray[iAsset].expenseRatio + '%'), 
					alignment: 'center' 
				}
			];
			
			averageExpenseRatio += (selectedFundFamilyArray[iAsset].expenseRatio == 'N/A' ? 0 : selectedFundFamilyArray[iAsset].expenseRatio )* currentDataArray[iAsset] / 100;
			fundTableBodyIndex++;
		}
	}
	
	fundTableBodyArray.push([
		{ text: 'Total Portfolio Expense Ratio (excludes possible commissions / advisor fees):',
			colSpan: 3,
			alignment: 'right'},'','',
		{ text: formatExpenseRatio(averageExpenseRatio), alignment: 'center' }
	]);
	
}

var dd = {
content: [
		{
			columns: [
				{
					image: 'rp_org_logo'
				},
				{
					text: 'Model Portfolio',
					style: 'title'
				}
			]
		},
		{
				style: 'tableExample',
				table: {
						widths: ['*', 100, 100],
						headerRows: 1,
						body: [
								[
									{ text: 'Portfolio', style: 'tableHeader' }, 
									{ text: 'Age Range', style: 'tableHeader'}, 
									{ text: 'Type of Account', style: 'tableHeader' }
								],
								[ 'Index ETF Portfolio', '{{ageRange}}', 'Retirement']
						]
				},
				layout: 'lightHorizontalLines'
		},
		{
				style: 'tableExample',
				table: {
						widths: ['*', 100],
						headerRows: 1,
						body: [
								[
									{ text: 'Rebalancing Frequency', style: 'tableHeader' }, 
									{ text: 'Stock / Bond Ratio', style: 'tableHeader'}
								],
								[ 
									'Monitor monthly but only rebalance when the asset allocation has drifted outside preset percentage band (10%), first use portfolio cashflows then use asset sale.', 
									'{{ratio}}'
								]
						]
				},
				layout: 'lightHorizontalLines'
		},
		{
				style: 'tableExample',
				table: {
						widths: [60, 100, '*', 75],
						headerRows: 1,
						body: [
								[
									{ text: 'Allocation', style: 'tableHeader' }, 
									{ text: 'Asset Class', style: 'tableHeader'}, 
									{ text: 'Fund Name', style: 'tableHeader' }, 
									{ text: 'Expense Ratio', style: 'tableHeader' }
								],
								[ 'Sample value 1', 'Sample value 2', 'Sample value 3', '0.1%' ],
								[ 'Sample value 1', 'Sample value 2', 'Sample value 3', '0.1%' ]
						]
				},
				layout: 'lightHorizontalLines'
		},
		{
			text: 'The information provided above is for educational purposes only and is not intended as specific investment advice for you. Fund expense ratios last updated on 9/2/2014.  Model Portfolios provided courtesy of EISRC.  ' +  pdfParameterToPrint.orgNameInPdfFooter + ' not providing or offering to provide services or advice to you and will not be liable for any losses you may incur as a result of any investment decision made.'
			,style: 'footer'
		}
		// ,
		// {
			// canvas: [
				// {
					// type: 'rect',
					// x: 0,
					// y: 10,
					// w: 500,
					// h: 50,
				// },
				// {
					// type: 'path',
					// x: 300,
					// y: 200,
					// w: 300,
					// h: 300,
					// path: "M84.7564567053368,70.11663887235586A110,110 0 0,1 -13.78665569207348,109.13261714459257L-7.519994013858263,59.526882078868674A60,60 0 0,0 46.230794566547345,38.245439384921376Z",
					// color: '#aec7e8'
				// }
			// ]
		// }
	],
	styles: {
		title: {
			fontSize: 16,
			bold: true,
			margin: [0, 6, 0, 0]
		},
		header: {
			fontSize: 18,
			bold: true,
			margin: [0, 0, 0, 10]
		},
		subheader: {
			fontSize: 16,
			bold: true,
			margin: [0, 10, 0, 5]
		},
		tableExample: {
			margin: [0, 5, 0, 15]
		},
		tableHeader: {
			bold: true,
			fontSize: 10,
			color: '#383838' //'#6C94C4'
		},
		footer: {
			fontSize: 8,
			italics: true, 
			color: 'gray'
		}
	},
	images: {
		rp_org_logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAAAlCAIAAADUanKxAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuM4zml1AAABA0SURBVHhe7Zr5W5NXFsfnj52ZTqft1NrWqrWdLi4d26oVRVBAQEHckDUYsu/7CgkkAQIJYQ+7iEvb+Vxv+jZNQgz2h8bnec/zPj7ve3PuWb/3nHN5/NuvKqlUx6QCVKW6JhWgKtU1qQBVqa5JBahKdU0qQFWqa1IBqlJdkwpQleqaVICqVNdUFwD95TcqfKv0Onrx8pdgau2xf94cWdh/9uLnn3+uHr3QVB7mxfwThfNVvAVJhrqlwwFU+jniy8rHn1jZ2Hn62uhUofz2/sn2wEfNHlMos7e39+LFi/oPWUWazG4WRyY2m68FN29Ge/svzt2NELQPr7n+0+iczizt7OxUCR38MB9pchsCs9vb20v5nbco5ocA6Pbec+knQfngqoOHFx5TcPbJkye1+OmML5PF5Pzmy5cvJbNncgWZCNE6J3K5HIEmqZK5bqncC47ZsVYfkZGIkcE51uIZn158+vQpbHLjG1C5LuieNU3Qjja7bg4Hbw76omOxbDZLCg4KXSq3hW2Y5AzE0+m0OTQnk/hWxPwQAI3O5KWfVx54mh86Lt6xv3fZ/K9L5g+uWNOzma2tLTBaYK1EdCWJ7xH39MbGBpkjLpu7+/2O6V5jJBAIxGKxfD5fXchfThW9KInMNzethIXnmw4XCNjd3X0zjFbUxSL1j5PQMRxwuVxOpzMUCs3NzVXBmSW6KE7OVZvT5RkbG0tnFx/ZUm9LzA8BUI4yfv77slVnMBsMBrvdfq7T8s8LRh6jzUOM5CHOrT0hYY7Y0sziFolhhaNPjWFFZrF7xG9wjc0vLD9//nxhbTeSWgyOJSKRSAqaW05kN3b3ngFcwooEuR3tFcWyvrzxlArBFlaoNPpgDpm8Q1tPnjGosWvnyT6fSgWCapSGDZnlbSHrVe4P8mLAPScjozdaiIzNZjvebJaRAT0LCwv7+/vIR7hUKisiMhWTFL2K46ube/bxxRJdy+u77ollFt+/Ym96YL83ZJboXF9fzy5vHSS8Q5+iXp5qtVut1mg0OjmzEErklJhvbgr+KrZVpEP5In/laLHOFrnCQMxeGeoqug4B0JbHCfw8ft1qNBo5u4lE4lyXhzrxzgU9K5zFpZV8uy4pD71sdt/fC29sbj979uz7B2My1u/+JDD9zkWTxTdBaL7oEMWgdTg6Ozu7srLyv3sR2DTu9PE20TFvPo5TmNc3dwhxRbH4hmR+MgbnTncHJQMPCdD55z5t8cqVLzt8+fVNWYEYyDoNU4eSxgxDFaTMHORF42AcOZ82ichQ0iYnJ7/tdMvIWCyWZDK5mt9s1f4hMpg0nV2VJhFbqbfY8XM9IThLdH1z268Y8I8fDTzxeDybW7qumThIOLk/2xNmCx0PgE5MTHx+0webEnPCW922EiKAbaN/SMdrfSGJC6tbF3vHlV1tIzH5K1MQseWQH4TRQwAUMOHnmQ6ryWTiID4wT6LpvQbbpW4TZSMSHT97RySVIPaZx2hABJHnvj6yvLx8qTfKTEaNee8n4/HG0VPNeq8vkEjNSA9pN1NTU0vLq2zn8+NmJ2KPNjke6EPJ1PSZ7kBFsQR3Z3cPn9ly7LqTFnbmtpeN/HqyxU6NOXXTc7JVFDZWNNbI4uIi/DJ8tUj7rrsg7Ys2B7kkypf7xsu9oIB91uolMmc7bTIyyXSOARG20zeNrIzHJmRkWLwxGG7s9b3fIJQyAFBcaTtcp6TeYsfP3HLxApuiy+P1UxE+uyEkv3/ZxOL5Dr3PH/z2tgDcQcLpHqgmGu19NppefDJVHPPllbXz96NVbCvBKFVQBvBQvqD061vCyE9vuHGB7IgYNth4JiaTmUymynxSK0Bpl9JPTjMHF5tICc/Vh16KBJ6TY8w60eoJR2M+n8/l9n7QINpca6+NU760tPTfDlFuz7bphoeHATQ8BncMCVipNXvC4bA/lsYHVHzcaB7RWylFHo+nS+Nj5XiLOxQZLxFLMYgkxdQBw2fNFq3RDv+J66LeYOGPXVba37DJR+3h81afhRrPMIcXFY0skabRC2mnbghpH181+P3++fl5MPpVp7fEC3oljrPrbIeZnvvIGKaiIIfRfOCxmaJ1TxeG4aMmp9EV8Xq9brebYoZYHrzm2CQyazK2iuPwMCCeuGHDeEUXezFS1uavWwqLHQOiRnzYaDc4wxWFx2eFcHgGtFb6njWQlD7KmA/aE/xaxTYaS3Fto2WDv0P5oiSRR2cPsmKx2gksrn3WZHI4HMCDCfvPApSBQ/pJsv/+gx7pYLRb40Ef6KRsUK5Iw+etjmv3bVfu2Y412zglwkqdiexOpzNgkS3Nd/U6nY6VmZmZR5ZJkdoGi8lsJR8DNvHJrs5eg16vJ5pM9CdaRO45c+Vii7fcHzLKLfRZbPvkql4zomUWHDIKPBG+nn4dYJJGnmpz1ijt8xYBka9axFg5PT3NDANDiRe20IzchRZ5dDGYAtync1M+UUrNw/fL9z0kg3CNj4/fGgnBBj9imQK1XnEykVDseGwiSbQxXtGFASDgyDURxms9BhaxmWKPukt3XdWFc1oIMkJ6zRNYq3xy8vmsYltJbfuyM4i0hgfeQ/kik3jhrhse0AKUaUoE9nSrTg6HjEl/FqDyhoQpmse6/mEtRQWbmLEMRnMwGIwlZ/kVI9BKkviX3LcM+Mx2NyWEYdwXm5NZfKQxYSWxphq1aQUgAAE1GJ4bQ1E+mXFxDB5mXHolK1XEyi2Aki2sUBdhRkvTXaNWq+WIPzSOsUKadczJNg/vtUtjlAQNSGvsMfFJQ4xOLcnoF3vxyCEASmRONulPXNNRR9v7nVa7CwYKjDMgxlOU3h504CbZYuBhLGOF4g2RnlbNODzFjjNvcHdksUTXTG5dGkCpJtOuoEBbdeHNQ2PwKEFuGhQ+yk+DXcxsMHcNOQ/aXgyd+dVdyidbqvCX+6IksXNAGIkNE1OiWsk0sQKsGUP/LECZo1HzyTULihGKiQCUUspBwazgpIAvJ3541AwyYKBycL75l+PClDbqEwjm4BpNFnAje0fJ8M6syedPPTZOFbtIEu2pulhmO7Z8f1vcTmjonrE0RuJ534gZZqJDvGAgH4RPY/YTJn6tUVpkUtzN0X53yELBYAzl4lXuxbUhgRJSMvqKJC75FZnUV28swxaU3h8WQtLp9Nb2rjLNy6SWO45YUzhXrosrvJSmN4pFe2hK+ltFOMMfn0qQGb6VzxFriPfq24sBGp9bl130UL4oSXygscpdD21T0ouHGjMrzKBcsP7sJYnajmJ5D6BkBsZSKACj33caOBPusVkiRRXp7jcyGDF2UPzBB9YQWdrELb3A99FG4QbbV1dXt3b25LAih/dEUsRanLN+UlxoLrHZPJ4cJHZ9Q/z9mS0tD4m2lcvykHNaSSrMuVyOyzhmkw/gqLEEYa5dmjn0+x+PpLROnRg3i73gan+yXaTku1uiZtDRAAECs9msuHXt7CSzBRc6ek0Al5uE1peRivq0NhTFJwojbLHjYKLLKAJSouuuRVRrZlPc4QgFJ0RfqiI8Ol4oscoNqfjT6hN3gCrbCUKPKdnQH4tMr718+XJ6YfMNfElkN2QYb/eJXRyqT26IQQs5tF959rjFF3BWRjUBVLkhkTxZmVZW8/hG6/y8WWQ6MT3H4IzKIw2Gi92WTk2w4VGYC29mQSQJ9e06AVDJf6bTQWtQDpYc3l1hwaB8kuD9/f2NnafcFg8Sm5ovHGi5hYPYPCz66alWAUeObzYn/mYp8wGFx0XLrl3aPYuACGMA0iRE5ExS7MXC6u+wBknM+2tra+Iyu78PnsAZl+iTbV6Uchm/0G073+PHa4RceeBBLKFzRwRoShynnJRHjHVu3Cye7xIOUq5yiyvVhTtCfxDuDAuPlM9EaoYZtMp2+PGOp0MbX19fX81vvoEvC2u7sLHrg58M3I2IFVCBhxsSZYJjRsRAfwFqZVQTQJUbkqzSdENy8G1XgGOBrazQy0Y9KUoXNZUHa7ADB6g6+XyeAh5KrQBoxj6mgnOdFiYqjUsEiy1yWpcXFOWTfMgEU8YOEqs0XLllaWnpzB3Rs37oenWa4/FQIifNHhy1ES/M1nmnapSGAZf7xDh17pbohtRabprB5HKJF85oYQyQkWEM2Nvbw2ylYfHuic1/0lS46qL0aJOjfciPPaKkxeMlcZCOszE8tVqia3VtndqDzW2P7LI+MZW6xjK1CDdbbMotUNFF6cL+KtutocLVYsAYoDNgmyMye1hfiMAdYwKoMPfzXLjj+LrdiV/ckAAou6rckKCaALq794z7AR0BU6glQIF5KJ3LW/2TWpOLui3Ct7oaT84M6N3M7w9HbAar+EMJeZ2fnwfNFNHU7AJTYM+AkUrDVJCcyXjHZ+3eKNspBrPzS4GJrMM3Jj85r5wq0ky+J1LpimIXVtaZfYu3cIdgDPX6AjQO+uzG5jZmc5PgcFNQiRcZrV1aZmkTC93eANtxUP49ucSL6XTGH88UR6akW+EC53NqZm7I6GV0Q6nF5oRZaoF/Ob9VoleWE1JbossdFX825jAgRJYJggPVIhwXgEJJkDmWOFVlO4kLJxcc/hgrBBBAb29vH9YXIoAcZyjRN+rs0xjB7ruXxJ87mu6IawBXT2xQznM51QRQAI4OKg3NXf7JGsVgFFByjlnEdLokR4Gocbnj9MibB0MMoxh1Hn7s4FcCTSLFkLCyggOswINktiNW+USdPFXkSa6XiyU3xKt4CyYRdMCE2zQO9LLIqISRsMEMQ+3SgBoWIo3teMpeTCrxgnW8Bt9KZMqLAb7jHf2OnHEeILTLIw12cZBfi/VKCcW6HJ6AwTX23Z0A9enja6I/KKNbjcJxgTggsCTIkqHKdrbw6+TkJAceTwnCYX3Z3nt+25CiVBvd4yD765vib2dgdEQrRnZEkSYZqIpUE0ABuLQVE7GAuLCCbkTjMIvSVYgXkkqt4jzJ5GE3nIoEAMS6/K8PbEcaEuR26bz8JO7FqiuKhQdLiiUoJgE1XviUe1lBtWR4A2mQlFbRC8wuiYy0vJgQzgGAn5MAsV1hhor1Ko5Diq72xzGgyUP5lH/iiUajrMPM9hqFw4PAkiC/dru0QfGOINSoTvElmFr76NX/DGRUwH6eI422Xq3wgupAGFEh/a1INQEUQjfGSeL9oEVeMAuVkpR1Scqvch3iRVLJZ2HDb8RKRbHlW5SVcga5AvH+ZtIk8VnFiwJTGUk2qZHtvBd+qKRXIVZgNobmLz6MNPcHBw0eyicNlKEf3Cj8NQrnvfizwHGY7cWLr+WXK8yHplCmqT90utN56a6rS+Nzun2MKDQBvADNCmdFqhWgKv2FBAioWEwRzCRMJjRQ6ha1qvBzfRP4A4X0faq+nAog5hbQiVNAvMB3AKkAfQuIHNMxmUmY2Bglabh0aqWe1TlhJ9ZiM5ZnMhmQynhKZ1cGgwLfAaQC9O0giihpliMv728LOiVhLZVS2g8x0PNZvbMrpAL0rSHS/HbhspzewAUVoCrVNakAVamuSQWoSnVNKkBVqmtSAapSXZMKUJXqmH799f/OWzli55EOwAAAAABJRU5ErkJggg=="
		,eisrc_logo: "data:image/jpg;base64,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"
	},
	defaultStyle: {
		// alignment: 'justify'
		fontSize: 10,
		color: '#383838'
	}
	
}				
