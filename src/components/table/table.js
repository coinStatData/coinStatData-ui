import React, { useState, useContext, useEffect } from 'react';
import UserContext from '../../hooks/userContext';
import Table from 'react-bootstrap/Table'
import { formatDate } from '../../util'
import { CSVLink } from "react-csv";
import { useSelector, useDispatch } from 'react-redux';
import { update_startDate } from '../../redux/slices/startDate';
import { update_endDate } from '../../redux/slices/endDate';
import './style.css';

function Table2(props) {
  const { resp_g, coin_g } = useContext(UserContext);
  const [tableD, setTableD] = useState();
  const [isLambda, setIsLambda] = useState();
  const dispatch = useDispatch()
  const sDate = useSelector((state) => state.startDate.value);
  const eDate = useSelector((state) => state.endDate.value);
  const tableData = useSelector((state) => state.tableData.value)
  
  useEffect(() => {
    //this is for lambda resp
    setTableD(resp_g)
    setIsLambda(true);
    if(Array.isArray(resp_g) && resp_g.length > 0) {
      dispatch(update_startDate(formatDate(new Date(resp_g[0].datetime * 1000))));
      dispatch(update_endDate(formatDate(new Date(resp_g[resp_g.length-1].datetime * 1000))));
    }
  }, [resp_g]);

  useEffect(() => {
    //this is coinGecko Resp
    setTableD(tableData)
    setIsLambda(false);
    if(Array.isArray(tableData.prices) && tableData.prices.length>5) {
      dispatch(update_startDate(formatDate(new Date(tableData.prices[0][0]))));
      dispatch(update_endDate(formatDate(new Date(tableData.prices[tableData.prices.length-1][0]))));
    }
  }, [tableData]);

  const csvData = () => {
    let data = [];
    let cdata = props.chartData;
    if(Array.isArray(cdata)){
      for(let i=0; i<cdata.length-2; i++)
        data.push({
          dateTime: cdata[i].name,
          price: cdata[i][coin_g]
        });
      return data;
    } else {
      return [];
    }
  }

  return (
    <div className="table-cont">
      <div className="table">
        <h3 className="table-title">Table of {coin_g.toUpperCase()}</h3>
        <p className="dateString">{sDate} ~ {eDate}</p>
        <CSVLink data={csvData()}>Download CSV</CSVLink>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {props.screenWidth > 650 &&
                <th>Coin</th>
              }
              <th>DateTime</th>
              <th>Price</th>
              {props.screenWidth > 450 &&
                <th>{isLambda? "Market Cap":"24_HR_Vol"}</th>
              }
            </tr>
          </thead>
          <tbody>
          {(isLambda && Array.isArray(tableD) && tableD.length > 0) &&
            tableD.map((item) => {
              return TableRow(item);
            })
          }
          {(!isLambda && Array.isArray(tableD?.prices)) &&
            makeTableGecko(tableD.prices, tableD.total_volumes, coin_g, props)
          }
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function TableRow(item) {
  return (
    <tr key={item.datetime}>
      <td>{item.coin}</td>
      <td>{formatDate(new Date(item.datetime * 1000))}</td>
      <td>{item.price}</td>
      <td>{Math.ceil(item.market_cap)}</td>
    </tr>
  )
}

function TableRowGecko(priceItem, volItem, coinname, props) {
  return (
    <tr key={priceItem[0]}>
      {props.screenWidth > 650 &&
        <td>{coinname}</td>
      }
      <td>{formatDate(new Date(priceItem[0]))}</td>
      <td>{priceItem[1]>10? priceItem[1].toFixed(2):priceItem[1].toFixed(7)}</td>
      {props.screenWidth > 450 &&
        <td>{Math.ceil(volItem[1])}</td>
      }
    </tr>
  )
}

function makeTableGecko(priceAr, volAr, coinname, props) {
  let arr = priceAr.map((item, index)=> {
    return TableRowGecko(priceAr[index], volAr[index], coinname, props);
  })
  return arr;
}

export default Table2;
