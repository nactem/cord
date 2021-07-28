package uk.ac.nactem.covid.bubblechart;

import java.util.Iterator;
import org.apache.commons.text.StringEscapeUtils;
import org.apache.wicket.Component;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.markup.head.IHeaderResponse;
import org.apache.wicket.markup.head.JavaScriptHeaderItem;
import org.apache.wicket.markup.head.OnLoadHeaderItem;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.model.IModel;
import org.apache.wicket.request.resource.PackageResourceReference;
import uk.ac.nactem.wicket.ajax.attributes.CallbackParameter;
import uk.ac.nactem.wicket.chart.ChartDataProvider;
import uk.ac.nactem.wicket.chart.DataItem;
import uk.ac.nactem.wicket.html.vis.VisPanel;

/**
 *
 * @author sam
 */
public class BubbleChartPanel extends VisPanel {
    
    private long bubbleCount = 20;
    private String initScript;
    private Component chart;
    private Callback link;
    private IModel<ChartDataProvider> model;
    
    public BubbleChartPanel(String id, IModel<ChartDataProvider> model) {
        super(id);
        this.model = model;
    }

    @Override
    protected void onInitialize() {
        super.onInitialize();
        add(chart = new WebMarkupContainer("chart").setOutputMarkupId(true));
        chart.getMarkupId();
        link = new Callback(CallbackParameter.explicit("id")) {
            @Override
            public void respond(AjaxRequestTarget target) {
                BubbleChartPanel.this.onClick(target, 
                        getRequest().getRequestParameters().getParameterValue("id").toString());
            }
        };
        add(link);
    }
    
    @Override
    protected void onBeforeRender() {
        super.onBeforeRender();
        String dataS = "";
        ChartDataProvider data = model.getObject();
        Iterator<DataItem> it = data.iterator(bubbleCount);
        while (it.hasNext()) {
            DataItem b = it.next();
            if (!dataS.isEmpty()) {
                dataS = dataS + ",";
            }
            dataS = dataS + String.format("{\"id\":\"%s\",\"text\":\"%s\",\"size\":%d,\"group\":\"%s\",\"title\":\"%s\"}",
                    b.getId(),
                    StringEscapeUtils.escapeJson(b.getLabel()),
                    b.getSize(),
                    StringEscapeUtils.escapeJson(b.getGroup()),
                    StringEscapeUtils.escapeJson(b.getTitle()));
        }
        dataS = "[" + dataS + "]";
        initScript = "var bbl = new simpleBubble.simpleBubble(\"cvalue\");\n"+
            "bbl.createSimpleBubbles(\"#"+chart.getMarkupId()+"\","+dataS+", 500, 700,"+ clickFunc()+");";
        //initScript = "new BubbleChart({onclick:"+clickFunc()+"}).chart('#" + chart.getMarkupId() + "',"+dataS+");";
    }
        
    @Override
    public void renderHead(IHeaderResponse response) {
        PackageResourceReference jsFile =
                    new PackageResourceReference(BubbleChartPanel.class, "bubble2.js");
        JavaScriptHeaderItem jsItem = JavaScriptHeaderItem.forReference(jsFile);
        response.render(jsItem);
        response.render(OnLoadHeaderItem.forScript(initScript));
    }
    
    protected void onClick(AjaxRequestTarget target, String id) {
        
    }
    
    private CharSequence clickFunc () {
        return link.getCallbackFunction((CallbackParameter[])null);
    }
}
